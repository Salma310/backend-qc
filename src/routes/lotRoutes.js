// routes/lot.routes.js
const router = require("express").Router();
const lotController = require("../controllers/lotController");

router.post("/", lotController.createLot);
router.get("/", lotController.getLots);
router.get("/:id", lotController.getLotById);
// router.put("/:id", lotController.updateLot);
// router.delete("/:id", lotController.deleteLot);

module.exports = router;
