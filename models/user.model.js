"use strict";

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  exercises: [{ type : mongoose.Schema.Types.ObjectId, ref: 'exercise' }],
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;