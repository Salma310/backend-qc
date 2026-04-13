// models/QRAccessLog.js
const mongoose = require("mongoose");

const QRAccessLogSchema = new mongoose.Schema({
  qr_id: { type: mongoose.Schema.Types.ObjectId, ref: "QRCode" },

  device_type: String,
  // Android / iOS / Desktop

  location: String,
  // Lokasi akses (jika ada)

  accessed_at: { type: Date, default: Date.now }
  // Waktu scan QR
});

module.exports = mongoose.model("QRAccessLog", QRAccessLogSchema);
