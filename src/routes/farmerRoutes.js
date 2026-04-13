const express = require("express");
const router = express.Router();

const farmerController = require("../controllers/farmerController");

router.post("/", farmerController.createFarmer);
router.get("/", farmerController.getAllFarmers);
router.get("/:id", farmerController.getFarmerById);
router.put("/:id", farmerController.updateFarmer);
router.delete("/:id", farmerController.deleteFarmer);

module.exports = router;
