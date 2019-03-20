const Airtable = require("airtable");
const Twilio = require("twilio");

module.exports = class Authenticator {
  constructor(options) {
    const base = new Airtable({ apiKey: options.airtableApiToken }).base(options.airtableBase);

    this.base = base;
    this.twilioAccountSid = options.twilioAccountSid;
    this.twilioAuthToken = options.twilioAuthToken;
    this.twilioNumber = options.twilioNumber;
    this.messagePrefix = options.messagePrefix;
  }

  async sendSms(phoneNumber) {
    const user = await this.getAirtableUserByPhoneNumber(phoneNumber);

    let userId;
    if (!user) {
      userId = await new Promise(resolve =>
        this.base("Users").create(
          {
            phone_number: phoneNumber
          },
          (err, record) => {
            resolve(record.id);
          }
        )
      );
    } else {
      userId = user.id;
    }

    const loginCode = Math.floor(Math.random() * 90000) + 10000;

    await this.updateAirtableUser({
      id: userId,
      fields: { login_code: loginCode.toString() }
    });

    const body = this.messagePrefix + loginCode;

    const TwilioClient = new Twilio(this.twilioAccountSid, this.twilioAuthToken);
    await TwilioClient.messages.create({
      body,
      to: phoneNumber,
      from: this.twilioNumber
    });

    return { OK: true };
  }

  async verifyLoginCode(phoneNumber, code) {
    const user = await this.getAirtableUserByPhoneNumber(phoneNumber);

    if (user && user.login_code === code) {
      await this.updateAirtableUser({
        id: user.id,
        fields: { phone_confirmed: true }
      });

      return { codeValid: true, userId: user.id };
    }

    return { codeValid: false };
  }

  async getAirtableUserByPhoneNumber(phoneNumber) {
    return new Promise(resolve =>
      this.base("Users")
        .select({
          view: "Grid view",
          filterByFormula: `{phone_number}='${phoneNumber}'`
        })
        .firstPage((err, records) => {
          if (!records || !records.length) return resolve();

          resolve({
            id: records[0].id,
            login_code: records[0].get("login_code")
          });
        })
    );
  }

  async updateAirtableUser({ id, fields }) {
    return new Promise(resolve =>
      this.base("Users").update(id, fields, (err, record) =>
        resolve({
          id: record.id
        })
      )
    );
  }
};
