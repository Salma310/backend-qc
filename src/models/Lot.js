// models/Lot.js
const mongoose = require("mongoose");

const LotSchema = new mongoose.Schema({
  land_id: { type: mongoose.Schema.Types.ObjectId, ref: "Land" },
  fruit_type: String,
  harvest_date: Date,
  quantity: Number,
  status: { type: String, default: "fresh" }
}, { timestamps: true });

module.exports = mongoose.model("Lot", LotSchema);
