const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../services/mongodb");
const userAuth = require("../middlewares/userAuth");
const { default: axios } = require("axios");
const { generateRandomCode, codeExpired } = require("../utils/common");
const bcrypt = require("bcrypt");
const config = require("../configs.json");
router.get("/courses", userAuth, async (req, res) => {
  const _id = req.user._id;

  const pipeline = [
    {
      $match: {
        userId: new ObjectId(_id),
      },
    },
    {
      $lookup: {
        from: "times",
        localField: "_id",
        foreignField: "courseId",
        as: "course_time",
      },
    },
    {
      $addFields: {
        total: {
          $size: "$course_time",
        },
      },
    },
    {
      $project: {
        course_time: 0,
      },
    },
    {
      $sort: {
        isFinished: 1,
        _id: -1,
      },
    },
  ];
  const data = await db
    .getCollection("setare", "courses")
    .aggregate(pipeline)
    .toArray();
  res.send(data);
});

router.post("/send-code", async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await db.findOne("users", { phoneNumber });
  if (!user) return res.status(404).send("کاربر یافت نشد");
  const threshold = config.codeExpires; //minutes
  const isExpired = codeExpired(user.codeTime, threshold);

  if (!isExpired)
    return res.status(429).send("ارسال بیش از حد مجاز،چند دقیقه صبر کنید");
  const randomCode = generateRandomCode(4).toString();
  try {
    const { data } = await axios.post(
      "https://api.sms.ir/v1/send/verify",
      {
        mobile: phoneNumber,
        templateId: 100000,
        parameters: [
          {
            name: "Code",
            value: randomCode,
          },
        ],
      },
      {
        headers: {
          "x-api-key": process.env.SMS_KEY,
        },
      }
    );
    console.log(data);
  } catch (error) {
    console.log(error);
    return res.status(499).send("سامانه پیامکی در دسترس نمیباشد");
  }

  const result = await db.updateOne(
    "users",
    { phoneNumber },
    { code: randomCode, codeTime: new Date() }
  );
  console.log(result);
  return res.send({ msg: "کد ارسال شد", codeExpires: config.codeExpires });
});
router.post("/reset-pass", async (req, res) => {
  const { phoneNumber, code, password } = req.body;
  const user = await db.findOne("users", { phoneNumber });
  if (!user) return res.status(404).send("کاربر یافت نشد");
  const threshold = config.codeExpires; //minutes
  const isExpired = codeExpired(user.codeTime, threshold);
  if (isExpired) return res.status(403).send("کد منقضی شده است");
  console.log(code, user.code);
  const correctCode = user.code === code;
  if (!correctCode) return res.status(400).send("کد اشتباه است");
  encryptedPass = await bcrypt.hash(password, 10);
  const result = await db.updateOne(
    "users",
    { phoneNumber },
    {
      code: generateRandomCode(4).toString(),
      password: encryptedPass,
      codeTime: new Date(),
    }
  );
  return res.send(result);
});

module.exports = router;
