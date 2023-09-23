const Joi = require("joi");
module.exports = {
  date: Joi.date().required(),

  didAttend: Joi.boolean().required(),
  _id: Joi.string().required(),
};
