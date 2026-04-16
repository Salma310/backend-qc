import express from "express";
import {
  getAllBatch,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  closeBatch,
  getActiveBatch,
} from "../controllers/batch.controller.js";

const router = express.Router();

router.get("/", getAllBatch);
router.get("/active", getActiveBatch);
router.get("/:id", getBatchById);

router.post("/", createBatch);

router.put("/:id", updateBatch);
router.put("/:id/close", closeBatch);

router.delete("/:id", deleteBatch);

export default router;