const mongoose = require("mongoose");

const countersSchema = mongoose.Schema({
  _id: String,
  sequence_value: Number,
});

module.exports = mongoose.model("counter", countersSchema, "counters");
