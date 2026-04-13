// models/Land.js
const mongoose = require("mongoose");

const LandSchema = new mongoose.Schema({
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true  },
  land_code: { type: String, unique: true }, 
  land_name: String,
  latitude: Number,
  longitude: Number,
  location: String,
  area_size: Number,
  fruit_type: String
}, { timestamps: true });

module.exports = mongoose.model("Land", LandSchema);
