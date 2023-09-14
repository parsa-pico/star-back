module.exports = function () {
  if (!process.env.JWT_PRIVATE_KEY) {
    console.log("jwt private key not defiend");
    throw new Error("jwt private key not defiend");
  }
  if (!process.env.MONGO_URL) {
    console.log("mongo url not defiend");
    throw new Error("mongo url not defiend");
  }
  if (!process.env.ADMIN_PASS) {
    console.log("admin pass not defiend");
    throw new Error("admin pass not defiend");
  }
  if (!process.env.BACK_END_URL) {
    console.log("back end url not defiend");
    throw new Error("back end url not defiend");
  }
};
