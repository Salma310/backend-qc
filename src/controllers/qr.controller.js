import { prisma } from "../lib/prisma.js";

/**
 * GET QR LOGS
 */
export const getQRLogs = async (req, res) => {
  try {
    const data = await prisma.qRAccessLog.findMany({
      include: {
        grading: true,
      },
      orderBy: { accessed_at: "desc" },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE QR LOG
 */
export const createQRLog = async (req, res) => {
  try {
    const data = await prisma.qRAccessLog.create({
      data: req.body,
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * AKSES QR
 */
export const getQRDetail = async (req, res) => {
  try {
    const { token } = req.params;

    const data = await prisma.gradingResult.findUnique({
      where: { qr_token: token },
      include: {
        batch: {
          include: {
            farmer: true,
            land: true,
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ message: "QR not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};