const express = require("express");
const app = express();
require("./src/config/db");

app.use(express.json());

app.use("/api/grading", require("./src/routes/gradingRoutes"));

app.get("/", (req, res) => {
  res.send("QC API running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

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
