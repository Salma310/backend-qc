import app from "./src/app.js";
import { prisma } from "./src/lib/prisma.js"; // ✅ named import

const PORT = 3000;

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
// const app = require("./src/app");
// const prisma = require("./src/config/db");

// const PORT = 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// // Graceful shutdown
// process.on("SIGINT", async () => {
//   await prisma.$disconnect();
//   process.exit(0);
// });
// // index.js — BARU
// const express = require("express");
// const cors = require("cors");
// const app = express();
// const prisma = require("./src/config/db");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: "http://localhost:5173" }));

// const routes = require("./src/routes");
// app.use("/api", routes);

// // Graceful shutdown — penting untuk Prisma
// process.on("SIGINT", async () => {
//   await prisma.$disconnect();
//   process.exit(0);
// });

// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });
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

// const express = require("express");
// const app = express();
// require("./src/config/db");

// app.use(express.json());

// app.use("/api/grading", require("./src/routes/gradingRoutes"));

// app.get("/", (req, res) => {
//   res.send("QC API running");
// });

// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });

// const express = require("express");
// const GradingResult = require("./models/GradingResult");

// const app = express();
// app.use(express.json());

// // TEST ROUTE
// app.get("/", (req, res) => {
//   res.send("Backend QC is running 🚀");
// });

// // INSERT DATA ROUTE
// app.post("/api/grading", async (req, res) => {
//   try {
//     const data = await GradingResult.create(req.body);
//     res.json({
//       message: "Grading saved",
//       data
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET ALL GRADING DATA
// app.get("/api/grading", async (req, res) => {
//   try {
//     const data = await GradingResult.find().sort({ created_at: -1 });
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.listen(3000, () =>
//   console.log("🚀 Backend running on http://localhost:3000")
// );
