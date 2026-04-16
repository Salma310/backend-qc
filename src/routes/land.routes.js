import express from "express";
import {
  getAllLand,
  getLandById,
  createLand,
  updateLand,
  deleteLand,
} from "../controllers/land.controller.js";

const router = express.Router();

router.get("/", getAllLand);
router.get("/:id", getLandById);

router.post("/", createLand);

router.put("/:id", updateLand);

router.delete("/:id", deleteLand);

export default router;