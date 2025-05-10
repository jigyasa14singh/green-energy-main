// server/models/Appliance.js
const mongoose = require('mongoose');

const ApplianceSchema = new mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
  },
  appliance: String,
  period: String, // 'day', 'month', 'year'
  consumption: Number,
  cost: Number,
});

module.exports = mongoose.model("Appliance", ApplianceSchema);