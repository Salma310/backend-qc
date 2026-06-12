import express from "express";

import {
  getWeeklyReport,
  getMonthlyReport,
  downloadWeeklyPdf,
  downloadMonthlyPdf,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/weekly", getWeeklyReport);
router.get("/monthly", getMonthlyReport);
router.get(
  "/weekly/pdf",
  downloadWeeklyPdf
);

router.get(
  "/monthly/pdf",
  downloadMonthlyPdf
);

export default router;