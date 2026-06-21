import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getAllBatch,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  closeBatch,
  getActiveBatch,
  getBatchBundles,
  getAllBundles,
} from "../controllers/batch.controller.js";

const router = express.Router();

// Static routes dulu (urutan penting!)
router.get("/", getAllBatch);
router.get("/active", getActiveBatch);
router.get("/bundles", getAllBundles); // harus sebelum /:id

// Dynamic routes
router.get("/:id", getBatchById);
router.get("/:id/bundles", getBatchBundles);

// Mutasi
router.post("/", authenticate, createBatch);
router.put("/:id", updateBatch);
router.patch("/:id/close", closeBatch);
router.delete("/:id", deleteBatch);

export default router;

