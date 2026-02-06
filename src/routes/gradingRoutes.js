const express = require("express");
const router = express.Router();
const gradingController = require("../controllers/gradingController");

router.post("/", gradingController.createGrading);
router.get("/", gradingController.getAllGrading);

module.exports = router;
