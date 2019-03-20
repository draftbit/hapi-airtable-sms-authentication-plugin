# Hapi Airtable SMS Authentication Plugin

A plugin that adds Twilio SMS authentication to a Hapi server, utilizing Airtable as a data store. It will add two endpoints - `/verify` and `/confirm` - that can be used to send a confirmation code and to confirm the confirmation code is correct.

## Usage

Register the plugin with your Hapi server by doing the following:

```
await server.register({
  plugin: require("@draftbit/hapi-airtable-sms-authentication-plugin"),
  options: {
    airtableBase: AIRTABLE_BASE,
    airtableApiToken: AIRTABLE_API_TOKEN,
    twilioAccountSid: TWILIO_ACCOUNT_SID,
    twilioAuthToken: TWILIO_AUTH_TOKEN,
    twilioNumber: TWILIO_NUMBER,
    messagePrefix: "Your Draftbit confirmation code is ",
  }
});
```

In Airtable, you must have a table called `Users`, with the following columns:

- `phone_number`, of type Single line text (not of type Phone Number, to avoid formatting inconsistencies)
- `login_code`, of type Single line text
- `phone_confirmed`, of type Checkbox

The following three routes will be added to your server:

- `/verify` - `GET` - Generates a code and triggers the first step in the authentication process, sending the SMS message. On success, returns `{ OK: true }`. On failure, returns `400 Bad Request`. The following query parameters are required:
  - `phoneNumber` - The phone number of the authenticating user
- `/confirm` - `GET` - Confirms that the code passed in for the phone number is the correct code. Marks `phone_confirmed` as true if user has entered correct code. On success, returns `{ userId: string }`. On failure, returns `401 Unauthorized`.
  - `phoneNumber` - The phone number of the authenticating user
  - `code` - The code that the user has entered

## Options

All options are required.

- `airtableBase` - The ID of the Airtable Base you wish to interact with
- `airtableApiToken` - Your Airtable API key
- `twilioAccountSid` - Twilio Account SID from www.twilio.com/console
- `twilioAuthToken` - Twilio Auth Token from www.twilio.com/console
- `twilioNumber` - Your Twilio phone number
- `messagePrefix` - The text to prefix in the SMS message before the code
