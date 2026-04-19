import express from "express";
import cors from "cors";

// routes
import batchRoutes from "./routes/batch.routes.js";
import gradingRoutes from "./routes/grading.routes.js";
import farmerRoutes from "./routes/farmer.routes.js";
import landRoutes from "./routes/land.routes.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import qrRoutes from "./routes/qr.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 API
app.use("/api/batch", batchRoutes);
app.use("/api/grading", gradingRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/land", landRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/qr", qrRoutes);

export default app;