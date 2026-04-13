const GradingResult = require("../models/GradingResult");
const n8nService = require("../../services/n8nService");

exports.createGrading = async (req, res) => {
  try {
    const grading = await GradingResult.create(req.body);

    await n8nService.sendRealtimeAlert(grading);

    res.status(201).json({
      message: "Grading saved",
      data: grading
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllGrading = async (req, res) => {
  try {
    const data = await GradingResult.find().sort({ created_at: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGradingById = async (req, res) => {
  try {
    const grading = await GradingResult.findById(req.params.id);
    res.json(grading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// const GradingResult = require("../models/GradingResult");
// const n8nService = require("../../services/n8nService");

// exports.createGrading = async (req, res) => {
//   try {
//     const grading = await GradingResult.create(req.body);

//     // trigger orchestration layer
//     await n8nService.sendRealtimeAlert(grading);

//     res.status(201).json({
//       message: "Grading saved",
//       data: grading
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getAllGrading = async (req, res) => {
//   const data = await GradingResult.find().sort({ created_at: -1 });
//   res.json(data);
// };
