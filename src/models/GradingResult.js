// models/GradingResult.js
const mongoose = require("mongoose");

const GradingSchema = new mongoose.Schema({
  lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot" },
  grade: String,
  confidence: Number,
  defect_detected: Boolean,
  expiry_prediction: Number,
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
