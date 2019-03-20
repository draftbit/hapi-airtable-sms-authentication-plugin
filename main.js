"use strict";

const Joi = require("joi");

const routes = require("./routes");

const schema = Joi.object().keys({
  airtableBase: Joi.string().required(),
  airtableApiToken: Joi.string().required(),
  twilioAccountSid: Joi.string().required(),
  twilioAuthToken: Joi.string().required(),
  twilioNumber: Joi.string().required(),
  messagePrefix: Joi.string().required()
});

module.exports = {
  pkg: require("./package.json"),
  multiple: true,
  register: async function(server, options) {
    const validSchema = schema.validate(options);

    if (validSchema.error) {
      throw new Error("Invalid schema passed to Airtable SMS Authentication plugin");
    }

    server.route(routes(options));
  }
};
