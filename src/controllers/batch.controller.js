import { prisma } from "../lib/prisma.js";
import { generateBatchCode } from "../utils/codeGenerator.js";
import { generateBundlesFromBatch, getBundlesByBatch } from "../../services/bundleService.js";
import { sendBatchClosedNotification } from "../../services/n8nService.js";

/**
 * GET ALL BATCH
 */
export const getAllBatch = async (req, res) => {
  try {
    const data = await prisma.batch.findMany({
      include: {
        farmer: true,
        land: true,
        created_by: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET BATCH BY ID
 */
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.batch.findUnique({
      where: { id },
      include: {
        farmer: true,
        land: true,
        created_by: true,
        gradings: true,
        bundles: true,
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE BATCH
 */
export const createBatch = async (req, res) => {
  try {
    const {
      farmer_id,
      land_id,
      fruit_type,
      harvest_date,
      harvest_weight,
      treatment,
      notes,
      created_by_id,
    } = req.body;
    const creatorId = req.user?.id ?? req.body.created_by_id ?? null;

    if (!creatorId) {
      return res.status(401).json({ message: "User tidak terautentikasi." });
    }

    const lot_code = await generateBatchCode(land_id);

    const data = await prisma.batch.create({
      data: {
        lot_code,
        farmer_id,
        land_id,
        fruit_type,
        harvest_date: harvest_date ? new Date(harvest_date) : null,
        harvest_weight,
        treatment,
        notes,
        created_by_id: creatorId,
      },
      include: {
        created_by: true,
      },
    });

    res.status(201).json(data);
  } catch (error) {
    console.error("ERROR CREATE BATCH:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE BATCH
 */
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.batch.update({
      where: { id },
      data: {
        ...req.body,
        harvest_date: req.body.harvest_date
          ? new Date(req.body.harvest_date)
          : undefined,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE BATCH
 */
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.batch.delete({ where: { id } });

    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CLOSE BATCH + GENERATE BUNDLE PER GRADE
 *
 * Flow:
 * 1. Update status batch  CLOSED
 * 2. Sortir semua GradingResult berdasarkan grade
 * 3. Generate BatchGradeBundle + QR token untuk tiap grade
 *
 * Response menyertakan bundle yang berhasil dibuat
 * beserta QR URL masing-masing.
 */
export const closeBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Pastikan batch ada dan masih OPEN
    const existing = await prisma.batch.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Batch tidak ditemukan" });
    }

    if (existing.status === "CLOSED") {
      return res.status(400).json({ message: "Batch sudah di-close sebelumnya" });
    }

    // 2. Close batch
    await prisma.batch.update({
      where: { id },
      data: {
        status: "CLOSED",
        closed_at: new Date(),
      },
    });

    // 3. Generate bundle per grade
    const bundles = await generateBundlesFromBatch(id);

    // 4. Ambil data lengkap batch untuk report
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        farmer: true,
        land: true,

        gradings: {
          select: {
            confidence: true,
          },
        },

        bundles: true,
      },
    });

    try {
      await sendBatchClosedNotification(batch);
    } catch (err) {
      console.error("N8N ERROR:", err.message);
    }

    res.json({
      message: "Batch berhasil di-close dan bundle berhasil dibuat",
      total_bundles: bundles.length,
      bundles: bundles.map((b) => ({
        id: b.id,
        grade: b.grade,
        total_fruits: b.total_fruits,
        total_weight: b.total_weight,
        qr_token: b.qr_token,
        qr_url: b.qr_url,
      })),
    });
  } catch (error) {
    console.error("ERROR CLOSE BATCH:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET BUNDLE BY BATCH ID
 * Untuk dashboard internal  melihat semua keranjang + detail per buah
 */
export const getBatchBundles = async (req, res) => {
  try {
    const { id } = req.params;

    const bundles = await getBundlesByBatch(id);

    if (!bundles.length) {
      return res.status(404).json({ message: "Bundle belum dibuat untuk batch ini" });
    }

    res.json(bundles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBundles = async (req, res) => {
  try {
    const bundles = await prisma.batchGradeBundle.findMany({
      include: {
        batch: { include: { farmer: true, land: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bundles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ACTIVE BATCH (OPEN)
 */
export const getActiveBatch = async (req, res) => {
  try {
    const data = await prisma.batch.findMany({
      where: { status: "OPEN" },
      include: {
        farmer: true,
        land: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

