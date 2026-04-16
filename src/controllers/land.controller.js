import { prisma } from "../lib/prisma.js";

/**
 * GET ALL LAND
 */
export const getAllLand = async (req, res) => {
  try {
    const data = await prisma.land.findMany({
      include: {
        farmer: true,
        batches: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET LAND BY ID
 */
export const getLandById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.land.findUnique({
      where: { id },
      include: {
        farmer: true,
        batches: true,
      },
    });

    if (!data) return res.status(404).json({ message: "Land not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE LAND
 */
export const createLand = async (req, res) => {
  try {
    const data = await prisma.land.create({
      data: req.body,
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE LAND
 */
export const updateLand = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.land.update({
      where: { id },
      data: req.body,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE LAND
 */
export const deleteLand = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.land.delete({
      where: { id },
    });

    res.json({ message: "Land deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};