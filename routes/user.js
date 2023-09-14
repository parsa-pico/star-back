const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Config = require("../entities/Config");
const db = require("../services/mongodb");

router.get("/config", async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("bad request");
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (error) {
    return res.status(498).send("account expired");
  }
  const type = parseInt(decoded.type);

  let lastRecord = (await db.find("configs", { type }))
    .sort({
      created_date: -1,
    })
    .limit(1);
  lastRecord = await lastRecord.toArray();
  const lastDate = lastRecord[0].created_date;

  let configs = db.getCollection(db.dataBase, "configs").aggregate([
    {
      $match: {
        created_date: lastDate,
      },
    },
    {
      $sample: {
        size: 1,
      },
    },
  ]);

  configs = await configs.toArray();
  //encode
  const encoded = Config.encodeBase64(configs.map((c) => c.link).join("\n"));
  return res.send(encoded);
});

router.get("/configV2", async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("bad request");
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (error) {
    return res.status(498).send("account expired");
  }

  const config = await db.findOne("configs", {
    _id: new ObjectId(decoded.configId),
  });
  //encode
  if (!config) return res.status(404).send("config not found");
  const encoded = Config.encodeBase64(config.link);

  return res.send(encoded);
});

module.exports = router;
