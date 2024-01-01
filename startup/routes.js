const express = require("express");
const cors = require("cors");
const error = require("../middlewares/error");
const admin = require("../routes/admin.js");
const user = require("../routes/user.js");
const bypass = require("../routes/bypass.js");
module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/bypass", bypass);
  app.use("/admin", admin);
  app.use("/user", user);
  app.use(error);
};
