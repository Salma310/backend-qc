import express from "express";
import {
  getAllFarmer,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from "../controllers/farmer.controller.js";

const router = express.Router();

router.get("/", getAllFarmer);
router.get("/:id", getFarmerById);

router.post("/", createFarmer);

router.put("/:id", updateFarmer);

router.delete("/:id", deleteFarmer);

export default router;