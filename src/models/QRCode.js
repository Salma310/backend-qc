// models/QRCode.js
const mongoose = require("mongoose");

const QRSchema = new mongoose.Schema({
  lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot" },
  grading_id: { type: mongoose.Schema.Types.ObjectId, ref: "GradingResult" },

  qr_token: { type: String, unique: true },
  qr_url: String,
  printed_at: Date,

  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("QRCode", QRSchema);
