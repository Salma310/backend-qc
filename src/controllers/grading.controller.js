import { prisma } from "../lib/prisma.js";

/**
 * GET ALL GRADING
 */
export const getAllGrading = async (req, res) => {
  try {
    const data = await prisma.gradingResult.findMany({
      include: {
        batch: true,
        graded_by: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

/**
 * GET GRADING BY BATCH
 */
export const getGradingByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const data = await prisma.gradingResult.findMany({
      where: {
        batch_id: batchId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE GRADING (CORE FLOW)
 */
export const createGrading = async (req, res) => {
  try {
    const {
      batch_id,
      grade,
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
      image_urls,
      graded_by_id,
    } = req.body;

    // 🔥 Generate code & QR
    const timestamp = Date.now();
    const grading_code = `GRD-${timestamp}`;
    const qr_token = `QR-${timestamp}`;

    const result = await prisma.gradingResult.create({
      data: {
        batch_id,
        grading_code,

        grade,
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

        image_urls: image_urls || [],

        qr_token,

        graded_by_id,
      },
    });

    // 🔥 UPDATE SUMMARY BATCH
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

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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