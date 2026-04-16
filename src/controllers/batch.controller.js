import { prisma } from "../lib/prisma.js";

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
      lot_code,
      farmer_id,
      land_id,
      fruit_type,
      harvest_date,
      harvest_time,
      harvest_weight,
      treatment,
      notes,
      created_by_id,
    } = req.body;

    const data = await prisma.batch.create({
      data: {
        lot_code,
        farmer_id,
        land_id,
        fruit_type,
        harvest_date: harvest_date ? new Date(harvest_date) : null,
        harvest_time: harvest_time ? new Date(harvest_time) : null,
        harvest_weight,
        treatment,
        notes,
        created_by_id,
      },
    });

    res.status(201).json(data);
  } catch (error) {
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
        harvest_time: req.body.harvest_time
          ? new Date(req.body.harvest_time)
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

    await prisma.batch.delete({
      where: { id },
    });

    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CLOSE BATCH
 */
export const closeBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.batch.update({
      where: { id },
      data: {
        status: "CLOSED",
        closed_at: new Date(),
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ACTIVE BATCH (OPEN)
 */
export const getActiveBatch = async (req, res) => {
  try {
    const data = await prisma.batch.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        farmer: true,
        land: true,
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