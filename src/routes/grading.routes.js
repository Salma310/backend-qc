import express from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  getAllGrading,
  getGradingById,
  createGrading,
  updateGrading,
  deleteGrading,
  getGradingStatus,
} from "../controllers/grading.controller.js";

const router = express.Router();


// Custom storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    // tanggal format YYYYMMDD
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");

    // sementara pakai timestamp dulu (nanti kita upgrade)
    const unique = Date.now();

    // urutan file
    if (!req.fileIndex) req.fileIndex = 1;
    const index = req.fileIndex++;

    const filename = `${date}-${unique}-${index}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({ storage });

const gradingUpload = upload.fields([
  { name: "images", maxCount: 10 },
]);


// ROUTES
router.get("/", getAllGrading);
router.get("/:id", getGradingById);

router.get('/:id/status',        getGradingStatus)
router.post("/", authenticate, gradingUpload, createGrading);

router.put('/:id',               updateGrading)
router.delete('/:id',            deleteGrading)

export default router;