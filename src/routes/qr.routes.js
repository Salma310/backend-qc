import express from "express";
import {
  getQRLogs,
  createQRLog,
} from "../controllers/qr.controller.js";

const router = express.Router();

router.get("/", getQRLogs);

router.post("/", createQRLog);

export default router;