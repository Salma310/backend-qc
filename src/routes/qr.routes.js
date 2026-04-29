import express from "express";
import {
  getQRDetail,
  getQRImage,
  getQRLogs,
  markAsPrinted,
  deactivateQR,
} from "../controllers/qr.controller.js";

const router = express.Router();

// qr.routes.js — urutkan dari yang paling spesifik dulu
router.get("/:token/image", getQRImage);      // ← pindah ke ATAS
router.get("/:token/logs", getQRLogs);        // ← pindah ke ATAS
router.patch("/:token/print", markAsPrinted);
router.patch("/:token/deactivate", deactivateQR);
router.get("/:token", getQRDetail);           // ← wildcard paling BAWAH

export default router;