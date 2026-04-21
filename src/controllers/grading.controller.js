import { prisma } from "../lib/prisma.js";
import { generateGradingCode } from "../utils/codeGenerator.js";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
// import { nanoid } from "nanoid";
// import prisma from "../prisma.js";
// import { generateGradingCode } from "../utils/generateGradingCode.js";

/**
 * GET ALL GRADING
 */
export const getAllGrading = async (req, res) => {
  try {
    const { batch_id } = req.query;

    console.log("batch_id query:", batch_id); // ← cek ini dulu di terminal

    const data = await prisma.gradingResult.findMany({
      where: batch_id ? { batch_id } : {},
      include: {
        batch: true,
        graded_by: {
          select: { id: true, name: true, role: true } // jangan expose password_hash
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// export const getAllGrading = async (req, res) => {
//   try {
//     const { batch_id } = req.query;

//     const data = await prisma.gradingResult.findMany({
//       where: batch_id
//         ? { batch_id }
//         : {},
//       include: {
//         batch: true,
//         graded_by: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAllGrading = async (req, res) => {
//   try {
//     const data = await prisma.gradingResult.findMany({
//       include: {
//         batch: true,
//         graded_by: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/**
 * GET GRADING BY ID
 */
export const getGradingById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.gradingResult.findUnique({
      where: { id },
      include: {
        batch: true,
        graded_by: true,
        qr_logs: true,
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Grading not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGradingByQr = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const data = await prisma.gradingResult.findUnique({
      where: { qr_token: qrToken },
      include: {
        batch: {
          include: {
            farmer: true,
            land: true,
          },
        },
        graded_by: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ message: "QR tidak ditemukan atau tidak valid" });
    }

    if (!data.qr_is_active) {
      return res.status(403).json({ message: "QR sudah tidak aktif" });
    }

    // Catat access log
    await prisma.qRAccessLog.create({
      data: {
        grading_id: data.id,
        device_type: req.headers["user-agent"]?.includes("Mobile") ? "Mobile" : "Desktop",
        ip_address: req.ip || req.headers["x-forwarded-for"] || null,
        user_agent: req.headers["user-agent"] || null,
        location: null, // isi dari GPS kalau frontend kirim
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * GET GRADING BY BATCH
 */
// export const getGradingByBatch = async (req, res) => {
//   try {
//     const { batchId } = req.params;

//     const data = await prisma.gradingResult.findMany({
//       where: {
//         batch_id: batchId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/**
 * CREATE GRADING (CORE FLOW)
 */

export const createGrading = async (req, res) => {
  try {
    // =========================
    // GET BODY
    // =========================
    const {
      batch_id,
      grade,
      ai_result,
      confidence_avg,
      total_detected,
      consistency,
      confidence,
      defect_detected,
      expiry_prediction,
      color_score,
      texture_score,
      defect_score,
      size_score,
      weight_estimate,
      ml_model_used,
      ml_model_version,
      graded_by_id,
    } = req.body;

    // =========================
    // PARSE DATA
    // =========================
    const parsedConfidence =
      confidence === "" || confidence === undefined
        ? null
        : parseFloat(confidence);

    const parsedDefect =
      defect_detected === "true" || defect_detected === true;

    // =========================
    // VALIDASI BATCH
    // =========================
    const batch = await prisma.batch.findUnique({
      where: { id: batch_id },
    });

    if (!batch)
      return res.status(404).json({ error: "Batch tidak ditemukan" });

    if (batch.status !== "OPEN") {
      return res
        .status(400)
        .json({ error: "Batch sudah ditutup, tidak bisa tambah grading" });
    }

    // =========================
    // GENERATE CODE
    // =========================
    const grading_code = await generateGradingCode(batch_id);
    const qr_token = `${grading_code}-${nanoid(6)}`;

    // =========================
    // RENAME FILES
    // =========================
    const uploadedFiles = req.files?.images || [];

    const date = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    const renamedFiles = uploadedFiles.map((file, index) => {
      const ext = path.extname(file.originalname);
      const newName = `${date}-${grading_code}-${index + 1}${ext}`;
      const newPath = path.join("uploads", newName);

      fs.renameSync(file.path, newPath);

      return `/uploads/${newName}`;
    });

    // =========================
    // SAVE TO DB
    // =========================
    const result = await prisma.gradingResult.create({
      data: {
        batch_id,
        grading_code,

        grade,
        confidence: parsedConfidence,
        defect_detected: parsedDefect,
        expiry_prediction,

        ai_result: ai_result ? JSON.parse(ai_result) : null,
        confidence_avg: confidence_avg ? parseFloat(confidence_avg) : null,
        total_detected: total_detected ? parseInt(total_detected) : null,
        consistency: consistency || null,

        color_score:
          color_score === "" ? null : parseFloat(color_score),
        texture_score:
          texture_score === "" ? null : parseFloat(texture_score),
        defect_score:
          defect_score === "" ? null : parseFloat(defect_score),
        size_score:
          size_score === "" ? null : parseFloat(size_score),
        weight_estimate:
          weight_estimate === "" ? null : parseFloat(weight_estimate),

        ml_model_used,
        ml_model_version,

        image_urls: renamedFiles,

        qr_token,
        graded_by_id,
      },
    });

    // =========================
    // UPDATE BATCH SUMMARY
    // =========================
    const updateData = {
      total_fruits: { increment: 1 },
    };

    if (grade === "A") updateData.total_grade_a = { increment: 1 };
    if (grade === "B") updateData.total_grade_b = { increment: 1 };
    if (grade === "C") updateData.total_grade_c = { increment: 1 };
    if (grade === "REJECT") updateData.total_reject = { increment: 1 };

    await prisma.batch.update({
      where: { id: batch_id },
      data: updateData,
    });

    console.log("REQ BODY:", req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// export const createGrading = async (req, res) => {
//   try {
//     // Get form fields from req.body (parsed by multer)
//     const {
//       batch_id,
//       grade,
//       expiry_prediction,
//       color_score,
//       texture_score,
//       defect_score,
//       size_score,
//       weight_estimate,
//       ml_model_used,
//       ml_model_version,
//       image_urls,
//       graded_by_id,
//     } = req.body;

//     const parsedConfidence =
//     confidence === '' || confidence === undefined
//       ? null
//       : parseFloat(confidence);

//     const parsedDefect =
//       defect_detected === 'true' || defect_detected === true;
    
//     // Get uploaded files
//     const uploadedFiles = req.files?.images || [];
//     import fs from "fs";
//     import path from "path";

//     const date = new Date().toISOString().split("T")[0].replace(/-/g, "");

//     const renamedFiles = uploadedFiles.map((file, index) => {
//       const ext = path.extname(file.originalname);
//       const newName = `${date}-${grading_code}-${index + 1}${ext}`;
//       const newPath = path.join("uploads", newName);

//       fs.renameSync(file.path, newPath);

//       return `/uploads/${newName}`;
//     });
//     const imageUrls = renamedFiles;
//     // const imageUrls = uploadedFiles.map(file => `/uploads/${file.filename}`);

//     // Cek batch masih OPEN
//     const batch = await prisma.batch.findUnique({
//       where: { id: batch_id }
//     })
//     if (!batch) return res.status(404).json({ error: 'Batch tidak ditemukan' })
//     if (batch.status !== 'OPEN') {
//       return res.status(400).json({ error: 'Batch sudah ditutup, tidak bisa tambah grading' })
//     }

//     // 🔥 Generate code & QR
//     const timestamp = Date.now();
//     const grading_code = await generateGradingCode(batch_id)
//     const qr_token = `${grading_code}-${nanoid(6)}`

//     const result = await prisma.gradingResult.create({
//       data: {
//         batch_id,
//         grading_code,

//         grade,
//         confidence: parsedConfidence,
//         defect_detected: parsedDefect,
//         expiry_prediction,

//         color_score,
//         texture_score,
//         defect_score,
//         size_score,
//         weight_estimate,

//         ml_model_used,
//         ml_model_version,

//         image_urls: imageUrls, // Use uploaded file URLs

//         qr_token,

//         graded_by_id,
//       },
//     });

//     // 🔥 UPDATE SUMMARY BATCH
//     const updateData = {
//       total_fruits: { increment: 1 },
//     };

//     if (grade === "A") updateData.total_grade_a = { increment: 1 };
//     if (grade === "B") updateData.total_grade_b = { increment: 1 };
//     if (grade === "C") updateData.total_grade_c = { increment: 1 };
//     if (grade === "REJECT") updateData.total_reject = { increment: 1 };

//     await prisma.batch.update({
//       where: { id: batch_id },
//       data: updateData,
//     });
//     console.log("REQ BODY:", req.body)
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/**
 * UPDATE GRADING
 */
export const updateGrading = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.gradingResult.update({
      where: { id },
      data: {
        ...req.body,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE GRADING
 */
export const deleteGrading = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.gradingResult.delete({
      where: { id },
    });

    res.json({ message: "Grading deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};