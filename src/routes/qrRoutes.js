const express = require("express");
const router = express.Router();

const qrController = require("../controllers/qrController");

// public endpoint (no auth)
router.get("/:qr_code", qrController.getByQRCode);

module.exports = router;
