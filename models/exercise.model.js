"use strict";

const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String },
});

const ExerciseModel = mongoose.model("exercise", exerciseSchema);

module.exports = ExerciseModel;