const express = require("express");
const router = express.Router();

const landController = require("../controllers/landController");

router.post("/", landController.createLand);
router.get("/", landController.getAllLands);
router.get("/:id", landController.getLandById);
router.put("/:id", landController.updateLand);
router.delete("/:id", landController.deleteLand);

module.exports = router;
