const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

/** Set Up Mongoose */

mongoose.connect(process.env.MONGO_URI.trim(), {
  useNewUrlParser: true,
  useUnifiedTopology: true})
.then(() => console.log("Connected to Mongo"))
.catch(err => console.error(err));

/** Create Models **/

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const UserModel = mongoose.model("user", userSchema);

/** Middlewares */

app.use(express.urlencoded({ extended: false })); // request parser mw
app.use(cors({ optionsSuccessStatus: 200 })); // cors mw
app.use(express.static("public")); // assets mw

/** Routes **/

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// POST /api/users

app.post("/api/users", async (req, res, next) => {
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
      _id: user._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }

});

// TODO: POST /api/users/:_id/exercises

// TODO: GET /api/users/:_id/logs?[from][&to][&limit]

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
