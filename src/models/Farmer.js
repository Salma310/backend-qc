// models/Farmer.js
const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
  farmer_code: { type: String, unique: true },
  name: { type: String, required: true },
  phone: String,
  address: String,
  village: String,
  district: String,
  city: String,
}, { timestamps: true });

module.exports = mongoose.model("Farmer", FarmerSchema);
