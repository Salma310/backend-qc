// models/Farmer.js
const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String
}, { timestamps: true });

module.exports = mongoose.model("Farmer", FarmerSchema);
