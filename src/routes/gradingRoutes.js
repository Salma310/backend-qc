const express = require("express");
const router = express.Router();

const gradingController = require("../controllers/gradingController");

// create grading + trigger n8n
router.post("/", gradingController.createGrading);

// get grading data
router.get("/", gradingController.getAllGrading);
router.get("/:id", gradingController.getGradingById);

module.exports = router;
