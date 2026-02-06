// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password_hash: String,
  role: { type: String, enum: ["admin", "qc", "manager"] },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
