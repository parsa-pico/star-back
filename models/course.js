const Joi = require("joi");
const { validateDaysObject } = require("../utils/common.js");
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
