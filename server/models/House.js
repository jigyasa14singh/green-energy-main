const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema({
  name: String,
  address: String,
  stats: {
    day: {
      production: Number,
      consumption: Number,
      cost: Number,
    },
    month: {
      production: Number,
      consumption: Number,
      cost: Number,
    },
    year: {
      production: Number,
      consumption: Number,
      cost: Number,
    },
  },
});

module.exports = mongoose.model("House", HouseSchema);