// models/Land.js
const mongoose = require("mongoose");

const LandSchema = new mongoose.Schema({
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
  location: String,
  area_size: Number,
  crop_type: String
}, { timestamps: true });

module.exports = mongoose.model("Land", LandSchema);
