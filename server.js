const express = require("express");
const app = express();

const cors = require("cors");

// Middlewares

app.use(cors({ optionsSuccessStatus: 200 })); // cors mw
app.use(express.static("public")); // assets mw

// Routes

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
