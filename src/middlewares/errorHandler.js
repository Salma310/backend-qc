// // models/Farmer.js
// const mongoose = require("mongoose");

// const FarmerSchema = new mongoose.Schema({
//   farmer_code: { type: String, unique: true },
//   name: { type: String, required: true },
//   phone: String,
//   address: String,
//   village: String,
//   district: String,
//   city: String,
// }, { timestamps: true });

// module.exports = mongoose.model("Farmer", FarmerSchema);


// // models/GradingResult.js
// const mongoose = require("mongoose");

// const GradingSchema = new mongoose.Schema({
//   lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot", required: true },
//   grading_code: String,
//   grade: { type: String, enum: ["A", "B", "C"], required: true },
//   confidence: Number,    // Tingkat kepercayaan model ML
//   defect_detected: Boolean,
//   expiry_prediction: Number,

//   // Skor visual untuk analisis lanjutan
//   color_score: Number,
//   texture_score: Number,
//   defect_score: Number,

//   // Metadata model AI
//   ml_model_used: String,
//   ml_model_version: String,

//   // Foto buah
//   image_url: [String],

//   grading_method: { type: String, enum: ["ai", "manual"], default: "ai" },

//   graded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// }, { timestamps: true });

// module.exports = mongoose.model("GradingResult", GradingSchema);


// // models/Land.js
// const mongoose = require("mongoose");

// const LandSchema = new mongoose.Schema({
//   farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true  },
//   land_code: { type: String, unique: true }, 
//   land_name: String,
//   latitude: Number,
//   longitude: Number,
//   location: String,
//   area_size: Number,
//   fruit_type: String
// }, { timestamps: true });

// module.exports = mongoose.model("Land", LandSchema);


// // models/Lot.js
// const mongoose = require("mongoose");

// const LotSchema = new mongoose.Schema({
//   lot_code: { type: String, unique: true },
//   farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
//   land_id: { type: mongoose.Schema.Types.ObjectId, ref: "Land" },
//   fruit_type: String,
//   harvest_date: Date,
//   harvest_weight: Number,
//   status: { 
//     type: String, 
//     enum: ["fresh", "graded", "expired"], 
//     default: "fresh" 
//   },
//   notes: String
// }, { timestamps: true });

// module.exports = mongoose.model("Lot", LotSchema);


// // models/Notification.js
// const mongoose = require("mongoose");

// const NotificationSchema = new mongoose.Schema({
//   lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot" },
//   grading_id: { type: mongoose.Schema.Types.ObjectId, ref: "GradingResult" },

//   channel: String,
//   // telegram / email

//   message: String,
//   // Isi notifikasi

//   status: String,
//   // sent / failed

//   sent_at: Date
// }, { timestamps: true });

// module.exports = mongoose.model("Notification", NotificationSchema);


// // models/QRAccessLog.js
// const mongoose = require("mongoose");

// const QRAccessLogSchema = new mongoose.Schema({
//   qr_id: { type: mongoose.Schema.Types.ObjectId, ref: "QRCode" },

//   device_type: String,
//   // Android / iOS / Desktop

//   location: String,
//   // Lokasi akses (jika ada)

//   accessed_at: { type: Date, default: Date.now }
//   // Waktu scan QR
// });

// module.exports = mongoose.model("QRAccessLog", QRAccessLogSchema);


// // models/QRCode.js
// const mongoose = require("mongoose");

// const QRSchema = new mongoose.Schema({
//   lot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lot" },
//   grading_id: { type: mongoose.Schema.Types.ObjectId, ref: "GradingResult" },

//   qr_token: { type: String, unique: true },
//   qr_url: String,
//   printed_at: Date,

//   is_active: { type: Boolean, default: true }
// }, { timestamps: true });

// module.exports = mongoose.model("QRCode", QRSchema);


// // models/User.js
// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true }, 
//   email: { type: String, unique: true },
//   password_hash: { type: String, required: true },
//   role: { type: String, enum: ["admin", "qc", "manager"] },
//   phone: String,
//   is_active: { type: Boolean, default: true },
//   last_login_at: Date
// }, { timestamps: true });

// module.exports = mongoose.model("User", UserSchema);


// /index.js
// const express = require("express");
// const cors = require("cors");
// const app = express();
// const connectDB = require("./src/config/db");

// connectDB();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//   origin: "http://localhost:5173"
// }));
// // app.use(cors());

// // routes
// const routes = require("./src/routes");
// app.use("/api", routes);
// app.listen(3000, () => {
//   console.log("Connection succes. Server running on http://localhost:3000");
// });


// /src/config/db.js
// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     console.log("✅ MongoDB try connect (jambu_qc)");
//     await mongoose.connect("mongodb://127.0.0.1:27017/jambu_qc");
//     console.log("✅ MongoDB connected (jambu_qc)");
//   } catch (err) {
//     console.error("❌ DB Error:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
