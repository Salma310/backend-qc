// models/QRCode.js
const mongoose = require("mongoose");

const QRSchema = new mongoose.Schema({
  lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot" },
  qr_token: { type: String, unique: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("QRCode", QRSchema);
