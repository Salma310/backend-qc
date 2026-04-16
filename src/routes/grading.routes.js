import express from "express";
import {
  getAllGrading,
  getGradingById,
  getGradingByBatch,
  createGrading,
  updateGrading,
  deleteGrading,
} from "../controllers/grading.controller.js";

const router = express.Router();

router.get("/", getAllGrading);
router.get("/batch/:batchId", getGradingByBatch);
router.get("/:id", getGradingById);

router.post("/", createGrading);

router.put("/:id", updateGrading);

router.delete("/:id", deleteGrading);

export default router;