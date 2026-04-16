import { prisma } from "../lib/prisma.js";

/**
 * GET ALL USER
 */
export const getAllUser = async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET USER BY ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.user.findUnique({
      where: { id },
    });

    if (!data) return res.status(404).json({ message: "User not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE USER
 */
export const createUser = async (req, res) => {
  try {
    const data = await prisma.user.create({
      data: req.body,
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE USER
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.user.update({
      where: { id },
      data: req.body,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE USER
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};