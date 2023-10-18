require("dotenv").config();
require("./startup/config")();
require("express-async-errors");
const dbService = require("./services/mongodb");

dbService.connect();
const app = require("express")();
require("./startup/routes")(app);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening on  port " + port));
