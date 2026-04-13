// models/GradingResult.js
const mongoose = require("mongoose");

const GradingSchema = new mongoose.Schema({
  lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot", required: true },
  grading_code: String,
  grade: { type: String, enum: ["A", "B", "C"], required: true },
  confidence: Number,    // Tingkat kepercayaan model ML
  defect_detected: Boolean,
  expiry_prediction: Number,

  // Skor visual untuk analisis lanjutan
  color_score: Number,
  texture_score: Number,
  defect_score: Number,

  // Metadata model AI
  ml_model_used: String,
  ml_model_version: String,

  // Foto buah
  image_url: [String],

  grading_method: { type: String, enum: ["ai", "manual"], default: "ai" },

  graded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("GradingResult", GradingSchema);

// const mongoose = require("../config/db");

// const GradingSchema = new mongoose.Schema({
//   lot_id: String,
//   fruit_type: String,
//   grade: String,
//   expiry_prediction: Number,
//   confidence: Number,
//   defect_detected: Boolean,
//   created_at: {
//     type: Date,
//     default: Date.now
//   }
// },
//  {
//     collection: "grading_results" // 🔒 DIKUNCI
//   }
// );

// module.exports = mongoose.model("GradingResult", GradingSchema);
