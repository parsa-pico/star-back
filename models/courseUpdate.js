const Joi = require("joi");
const { validateDaysObject } = require("../utils/common.js");
const schema = {
  _id: Joi.string().required(),
  level: Joi.string().required().max(100),
  paymentAmount: Joi.number().required(),
  payedAmount: Joi.number().required(),
  isFinished: Joi.boolean().required(),
  days: Joi.required().custom(function validate(value, helpers) {
    if (!validateDaysObject(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
  scores: Joi.custom(function validate(value, helpers) {
    const keys = ["midTerm", "final", "extra", "activity"];
    for (let key of keys) {
      val = value[key];
      if (typeof val !== "number" && val !== null) {
        console.log(val, typeof val);
        return helpers.error("any.invalid");
      }
    }
    return value;
  }),
};
module.exports = schema;
