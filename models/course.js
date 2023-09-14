const Joi = require("joi");
const { validateDaysObject } = require("../utils/common.js");
const { log } = require("console");
const customDaysValidation = (joi) => ({
  type: "custom1",
  base: joi.object(),
  messages: {
    customInvalid: "Invalid days object",
  },
});

const extendedJoi = Joi.extend(customDaysValidation);

const schema = {
  userId: Joi.string().required(),
  level: Joi.string().required().max(100),
  paymentAmount: Joi.number().required(),
  days: Joi.required().custom(function validate(value, helpers) {
    if (!validateDaysObject(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
};
module.exports = schema;
