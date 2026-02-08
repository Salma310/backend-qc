const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("✅ MongoDB try connect (jambu_qc)");
    await mongoose.connect("mongodb://127.0.0.1:27017/jambu_qc");
    console.log("✅ MongoDB connected (jambu_qc)");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
