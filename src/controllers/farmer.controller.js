import { prisma } from "../lib/prisma.js";

/**
 * GET ALL FARMER
 */
export const getAllFarmer = async (req, res) => {
  try {
    const data = await prisma.farmer.findMany({
      include: {
        lands: true,
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
 * GET FARMER BY ID
 */
export const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.farmer.findUnique({
      where: { id },
      include: {
        lands: true,
        batches: true,
      },
    });

    if (!data) return res.status(404).json({ message: "Farmer not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE FARMER
 */
export const createFarmer = async (req, res) => {
  try {
    const data = await prisma.farmer.create({
      data: req.body,
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE FARMER
 */
export const updateFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.farmer.update({
      where: { id },
      data: req.body,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE FARMER
 */
export const deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.farmer.delete({
      where: { id },
    });

    res.json({ message: "Farmer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};