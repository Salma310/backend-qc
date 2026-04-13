// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot" },
  grading_id: { type: mongoose.Schema.Types.ObjectId, ref: "GradingResult" },

  channel: String,
  // telegram / email

  message: String,
  // Isi notifikasi

  status: String,
  // sent / failed

  sent_at: Date
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
