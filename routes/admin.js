const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const adminAuth = require("../middlewares/adminAuth");
const db = require("../services/mongodb");
const Joi = require("joi");
const userSchema = require("../models/user.js");
const courseSchema = require("../models/course.js");
const courseUpdateSchema = require("../models/courseUpdate");
const timeSchema = require("../models/time.js");
const timeUpdateSchema = require("../models/timeUpdate");
const loginSchema = require("../models/login.js");
const { log } = require("console");
const { validate, generateRandomCode } = require("../utils/common.js");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const r = validate(loginSchema, req.body, res);
  if (r) return;
  const { phoneNumber, password } = req.body;
  const user = await db.findOne("users", { phoneNumber });
  if (!user) return res.status(404).send("کاربر یافت نشد");

  const isAdmin = user.isAdmin ? true : false;
  const { firstName, lastName, phoneNumber: p, _id } = user;
  const correctPass = await bcrypt.compare(password, user.password);
  if (!correctPass) return res.status(400).send("رمز صحیح نمیباشد");
  const token = jwt.sign(
    { firstName, lastName, phoneNumber: p, isAdmin, _id },
    process.env.JWT_PRIVATE_KEY
  );
  return res.send(token);
});

router.post("/sign-up-user", adminAuth, async (req, res) => {
  const r = validate(userSchema, req.body, res);
  if (r) return;
  const { firstName, lastName, phoneNumber, password } = req.body;
  user = await db.findOne("users", { phoneNumber });
  if (user) return res.status(409).send("شماره تلفن قبلا ثبت شده");
  encryptedPass = await bcrypt.hash(password, 10);
  const result = await db.insertOne("users", {
    firstName,
    lastName,
    phoneNumber,
    password: encryptedPass,
    codeTime: new Date(),
    code: generateRandomCode(4).toString(),
  });
  res.send(result);
});
router.get("/users", adminAuth, async (req, res) => {
  const { firstName, lastName } = req.query;
  const result = await (
    await db.find("users", {
      firstName: { $regex: new RegExp(firstName, "i") },
      lastName: { $regex: new RegExp(lastName, "i") },
    })
  ).toArray();
  res.send(result);
});

router.post("/course", adminAuth, async (req, res) => {
  const r = validate(courseSchema, req.body, res);
  if (r) return;
  const { userId, days, level, paymentAmount } = req.body;
  if (!ObjectId.isValid(userId))
    return res.status(400).send("آیدی کاربر معتبر نیست");
  const user = await db.findOne("users", { _id: new ObjectId(userId) });

  if (!user) return res.status(404).send("کاربر یافت نشد");
  const result = await db.insertOne("courses", {
    userId: user._id,
    days,
    level,
    paymentAmount: parseInt(paymentAmount),
    isFinished: false,
    payedAmount: 0,
    scores: { midTerm: null, final: null, extra: null, activity: null },
  });
  res.send(result);
});
router.put("/course", adminAuth, async (req, res) => {
  const r = validate(courseUpdateSchema, req.body, res);
  if (r) return;
  const { _id, level, paymentAmount, payedAmount, isFinished, scores, days } =
    req.body;
  if (!ObjectId.isValid(_id))
    return res.status(400).send("آیدی دوره معتبر نیست");
  const user = await db.findOne("courses", { _id: new ObjectId(_id) });

  if (!user) return res.status(404).send("دوره یافت نشد");
  const result = await db.updateOne(
    "courses",
    { _id: new ObjectId(_id) },
    {
      level,
      paymentAmount,
      isFinished,
      payedAmount,
      scores,
      days,
    }
  );
  res.send(result);
});
router.delete("/course/:id", adminAuth, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectId.isValid(_id))
    return res.status(400).send("آیدی دوره معتبر نیست");
  const user = await db.findOne("courses", { _id: new ObjectId(_id) });

  if (!user) return res.status(404).send("دوره یافت نشد");
  const result = await db.deleteOne("courses", { _id: new ObjectId(_id) });
  res.send(result);
});

router.get("/courses", adminAuth, async (req, res) => {
  const { firstName, lastName } = req.query;

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
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
      $project: {
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        days: 1,
        level: 1,
        paymentAmount: 1,
        isFinished: 1,
        payedAmount: 1,
        scores: 1,
        courseId: "$_id",
        total: {
          $size: "$course_time",
        },
        totalAttended: {
          $sum: {
            $map: {
              input: "$course_time",
              as: "ct",
              in: {
                $cond: {
                  if: "$$ct.didAttend",
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
      },
    },
  ];

  if (firstName || lastName) {
    pipeline.push({
      $match: {
        $and: [
          firstName ? { firstName: { $regex: firstName, $options: "i" } } : {},
          lastName ? { lastName: { $regex: lastName, $options: "i" } } : {},
        ],
      },
    });
  }
  pipeline.push({
    $sort: {
      isFinished: 1,
      _id: -1,
    },
  });

  const courses = await db
    .getCollection("setare", "courses")
    .aggregate(pipeline)
    .toArray();

  res.send(courses);
});
router.get("/course", adminAuth, async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await db.findOne("users", { phoneNumber });
  if (!user) return res.status(404).send("کاربر یافت نشد");
  const courses = await (
    await db.find("courses", { userId: user._id })
  ).toArray();

  res.send(courses);
});

router.post("/times", adminAuth, async (req, res) => {
  const r = validate(timeSchema, req.body, res);
  if (r) return;
  const { didAttend, courseId, date } = req.body;
  if (!ObjectId.isValid(courseId))
    return res.status(400).send("آیدی دوره معتبر نیست");
  const course = await db.findOne("courses", { _id: new ObjectId(courseId) });
  if (!course) return res.status(404).send("دوره یافت نشد");
  const result = await db.insertOne("times", {
    didAttend,
    courseId: new ObjectId(courseId),
    date: new Date(date),
  });
  res.send(result);
});
router.put("/times", adminAuth, async (req, res) => {
  const r = validate(timeUpdateSchema, req.body, res);
  if (r) return;
  const { didAttend, date, _id } = req.body;
  if (!ObjectId.isValid(_id))
    return res.status(400).send("آیدی زمان انتخاب شده متعبر نیست");
  const result = await db.updateOne(
    "times",
    { _id: new ObjectId(_id) },
    {
      didAttend,
      date: new Date(date),
    }
  );
  res.send(result);
});
router.get("/times", adminAuth, async (req, res) => {
  const { courseId } = req.query;

  const result = await (
    await db.find("times", { courseId: new ObjectId(courseId) })
  ).toArray();

  res.send(result);
});
module.exports = router;
