// TODO: You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

/** Set Up Mongoose */

mongoose
  .connect(process.env.MONGO_URI.trim(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to Mongo"))
  .catch((err) => console.error(err));

/** Create Models **/

const UserModel = require(__dirname + "/models/user.model");
const ExerciseModel = require(__dirname + "/models/exercise.model");

/** Date functions */

const getDateString = (dateString) => {
  let date = new Date();
  // Check if timestamp
  if (/^\d*$/.test(dateString)) {
    date.setTime(dateString);
  } else {
    date = new Date(dateString);
  }
  // Check if valid date
  if (!date.getTime()) {
    date = new Date();
  }
  return date.toISOString().slice(0, 10); // yyy-mm-dd
};

/** Middlewares */

app.use(express.urlencoded({ extended: false })); // request parser mw
app.use(cors({ optionsSuccessStatus: 200 })); // cors mw
app.use(express.static("public")); // assets mw

/** Basic routes **/

app.route("/").get((req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.route("/api/hello").get((req, res) => {
  res.json({ greeting: "hello API" });
});

/** /api/users **/

app
  .route("/api/users")
  .get(async (req, res) => {
    try {
      const users = await UserModel.find({});
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json("Server error");
    }
  })
  .post(async (req, res, next) => {
    const userName = req.body.username || "";

    if (!userName.trim()) {
      res.json({ error: "An username is required" });
      return next();
    }

    try {
      let user = await UserModel.findOne({ username: userName });

      if (!user) {
        user = new UserModel({ username: userName });
        await user.save();
      }

      res.json({
        username: user.username,
        _id: user._id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json("Server error");
    }
  });

/** /api/users/:_id/exercises **/

app.route("/api/users/:_id/exercises").post(async (req, res, next) => {
  const userId = req.params._id || "";
  const description = req.body.description || "";
  const duration = req.body.duration || 0;
  const date = getDateString(req.body.date);

  if (!userId.trim()) {
    res.json({ error: "The user _id is required" });
    return next();
  }

  if (!description.trim()) {
    res.json({ error: "A description is required" });
    return next();
  }

  if (isNaN(duration) || duration <= 0) {
    res.json({ error: "A numeric duration is required" });
    return next();
  }

  try {
    // Get user

    const user = await UserModel.findById(userId);

    if (!user) {
      res.json({ error: "There is no user with _id: " + userId });
      return next();
    }

    // Save exercise

    let exercise = new ExerciseModel({
      description: description,
      duration: duration,
      date: date,
    });
    await exercise.save();

    // Save user

    user.exercises.push(exercise._id);
    await user.save();

    // Response data

    res.json({
      _id: user._id,
      username: user.username,
      description: description,
      duration: Number(duration),
      date: new Date(date).toDateString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

/** /api/users/:_id/logs?[from][&to][&limit] **/

app.route("/api/users/:_id/logs").get(async (req, res) => {
  try {
    const user = await UserModel.findById(req.params._id).populate(
      "exercises",
      "-_id -__v"
    );
    res.json({
      _id: user._id,
      username: user.username,
      count: user.exercises.length,
      log: user.exercises.map((item) => ({
        description: item.description,
        duration: item.duration,
        date: new Date(item.date).toDateString(),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
