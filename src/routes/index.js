const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/farmers", require("./farmerRoutes"));
router.use("/lands", require("./landRoutes"));
router.use("/grading", require("./gradingRoutes"));
router.use("/qr", require("./qrRoutes"));

module.exports = router;
