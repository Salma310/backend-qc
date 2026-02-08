// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin", "qc", "manager"] },
  phone: String,
  is_active: { type: Boolean, default: true },
  last_login_at: Date
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
