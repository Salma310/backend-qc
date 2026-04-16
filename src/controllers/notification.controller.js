import { prisma } from "../lib/prisma.js";

/**
 * GET ALL NOTIFICATION
 */
export const getAllNotification = async (req, res) => {
  try {
    const data = await prisma.notification.findMany({
      include: {
        batch: true,
        grading: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE NOTIFICATION
 */
export const createNotification = async (req, res) => {
  try {
    const data = await prisma.notification.create({
      data: req.body,
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};