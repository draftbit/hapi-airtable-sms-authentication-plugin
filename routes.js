"use strict";

const Boom = require("boom");
const Joi = require("joi");

const Authenticator = require("./Authenticator");

module.exports = function routes(options) {
  return [
    {
      method: "GET",
      path: "/verify",
      config: {
        auth: false,
        validate: {
          query: {
            phoneNumber: Joi.string().required()
          }
        }
      },
      handler: async request => {
        try {
          const authenticator = new Authenticator(options);
          return authenticator.sendSms(request.query.phoneNumber);
        } catch (err) {
          return Boom.badRequest();
        }
      }
    },
    {
      method: "GET",
      path: "/confirm",
      config: {
        auth: false,
        validate: {
          query: {
            phoneNumber: Joi.string().required(),
            code: Joi.string().required()
          }
        }
      },
      handler: async (request, h) => {
        const authenticator = new Authenticator(options);

        const { phoneNumber, code } = request.query;
        const { codeValid, userId } = await authenticator.verifyLoginCode(phoneNumber, code);

        if (!userId) return Boom.unauthorized();

        return { userId };
      }
    }
  ];
};
