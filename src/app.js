import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// routes
import authRoutes from "./routes/auth.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import gradingRoutes from "./routes/grading.routes.js";
import farmerRoutes from "./routes/farmer.routes.js";
import landRoutes from "./routes/land.routes.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { getQRResultPage } from "./controllers/qr.controller.js";

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.11.171:5173',  // ← tambahkan ini
    'http://192.168.11.42:3000',  // ← dan ini kalau perlu
  ],
  credentials: true,
}))


const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan folder uploads/qr ada saat server start
const qrFolder = path.join(__dirname, "../uploads/qr");
if (!fs.existsSync(qrFolder)) {
  fs.mkdirSync(qrFolder, { recursive: true });
  console.log("Folder uploads/qr dibuat");
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WEB ROUTES (HTML Pages)
app.get("/qr/:token", getQRResultPage);

// API
app.use("/api/auth", authRoutes);   
app.use("/api/batch", batchRoutes);
app.use("/api/gradings", gradingRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/land", landRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;