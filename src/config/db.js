const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/jambu_qc");
    console.log("✅ MongoDB connected (jambu_qc)");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/jambu_qc");

// mongoose.connection.on("connected", () => {
//   console.log("✅ MongoDB connected");
// });

// mongoose.connection.on("error", (err) => {
//   console.error("❌ MongoDB error:", err);
// });

// module.exports = mongoose;
