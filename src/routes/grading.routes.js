import express from "express";
import multer from "multer";
import path from "path";

import {
  getAllGrading,
  getGradingById,
  getGradingByQr,
  createGrading,
  updateGrading,
  deleteGrading,
} from "../controllers/grading.controller.js";

const router = express.Router();


// 🔥 CUSTOM STORAGE
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
router.get("/qr/:qrToken", getGradingByQr);
router.get("/:id", getGradingById);

router.post("/", gradingUpload, createGrading);

export default router;
// import express from "express";
// import multer from "multer";
// import {
//   getAllGrading,
//   getGradingById,
//   getGradingByQr,
//   createGrading,
//   updateGrading,
//   deleteGrading,
// } from "../controllers/grading.controller.js";

// const router = express.Router();

// // Configure multer for grading uploads
// const upload = multer({ dest: 'uploads/' });

// const gradingUpload = upload.fields([
//   { name: 'images', maxCount: 10 } // Allow up to 10 images
// ]);

// // GET /api/gradings             → semua grading
// // GET /api/gradings?batch_id=xx → filter by batch
// router.get("/", getAllGrading);

// // ⚠️ Route spesifik HARUS di atas route param
// router.get("/qr/:qrToken", getGradingByQr);  // kalau ada

// // Baru route dengan param
// router.get("/:id", getGradingById);

// router.post("/", gradingUpload, createGrading);

// export default router;
// import express from "express";
// import {
//   getAllGrading,
//   getGradingById,
//   // getGradingByBatch,
//   createGrading,
//   updateGrading,
//   deleteGrading,
// } from "../controllers/grading.controller.js";

// const router = express.Router();

// router.get("/", getAllGrading);
// // router.get("/:batchId", getGradingByBatch);
// router.get("/:id", getGradingById);

// router.post("/", createGrading);

// router.put("/:id", updateGrading);

// router.delete("/:id", deleteGrading);

// export default router;