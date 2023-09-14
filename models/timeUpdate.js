const Joi = require("joi");
module.exports = {
  date: Joi.date().required(),
  courseId: Joi.string().required(),
  didAttend: Joi.boolean().required(),
  _id: Joi.string().required(),
};
