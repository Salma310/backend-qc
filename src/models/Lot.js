// models/Lot.js
const mongoose = require("mongoose");

const LotSchema = new mongoose.Schema({
  lot_code: { type: String, unique: true },
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
  land_id: { type: mongoose.Schema.Types.ObjectId, ref: "Land" },
  fruit_type: String,
  harvest_date: Date,
  harvest_weight: Number,
  status: { 
    type: String, 
    enum: ["fresh", "graded", "expired"], 
    default: "fresh" 
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Lot", LotSchema);
