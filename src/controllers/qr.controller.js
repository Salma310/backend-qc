import { prisma } from "../lib/prisma.js";
import { getBundleByToken } from "../../services/bundleService.js";

/**
 * AKSES QR PUBLIK
 * Dipanggil saat sticker di-scan
 * Otomatis mencatat log akses
 *
 * GET /api/qr/:token
 */
export const getQRDetail = async (req, res) => {
  try {
    const { token } = req.params;

    const bundle = await prisma.batchGradeBundle.findUnique({
      where: { qr_token: token },
      include: {
        batch: {
          include: {
            farmer: true,
            land: true,
          },
        },
        grading_results: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!bundle) {
      return res.status(404).json({ message: "QR tidak ditemukan" });
    }

    if (!bundle.qr_is_active) {
      return res.status(410).json({ message: "QR sudah tidak aktif" });
    }

    // Catat access log
    await prisma.bundleQRAccessLog.create({
      data: {
        bundle_id:   bundle.id,
        ip_address:  req.ip || req.headers["x-forwarded-for"] || null,
        user_agent:  req.headers["user-agent"] || null,
        device_type: getDeviceType(req.headers["user-agent"]),
      },
    });

    res.json(bundle); // return full object — frontend bisa ambil semua field
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET URL FILE QR IMAGE
 * Return path file PNG yang sudah tersimpan di uploads/qr/
 *
 * GET /api/qr/:token/image
 */
export const getQRImage = async (req, res) => {
  try {
    const { token } = req.params;

    const bundle = await prisma.batchGradeBundle.findUnique({
      where: { qr_token: token },
      select: {
        qr_image_path: true,
        qr_is_active: true,
        grade: true,
      },
    });

    if (!bundle) {
      return res.status(404).json({ message: "QR tidak ditemukan" });
    }

    if (!bundle.qr_image_path) {
      return res.status(404).json({ message: "File QR belum di-generate" });
    }

    const imageUrl = `${process.env.PUBLIC_BASE_URL}${bundle.qr_image_path}`;

    res.json({
      grade: bundle.grade,
      image_url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * TANDAI BUNDLE SUDAH DICETAK
 *
 * PATCH /api/qr/:token/print
 * Body: { printed_by_id: "uuid" }
 */
export const markAsPrinted = async (req, res) => {
  try {
    const { token } = req.params;
    const { printed_by_id } = req.body;

    const bundle = await prisma.batchGradeBundle.findUnique({
      where: { qr_token: token },
    });

    if (!bundle) {
      return res.status(404).json({ message: "Bundle tidak ditemukan" });
    }

    const updated = await prisma.batchGradeBundle.update({
      where: { qr_token: token },
      data: {
        print_status: bundle.print_count > 0 ? "REPRINTED" : "PRINTED",
        printed_at: new Date(),
        printed_by_id: printed_by_id || null,
        print_count: { increment: 1 },
      },
    });

    res.json({
      message: "Status print berhasil diupdate",
      print_status: updated.print_status,
      print_count: updated.print_count,
      printed_at: updated.printed_at,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * NONAKTIFKAN QR
 * Misal sticker rusak / hilang
 *
 * PATCH /api/qr/:token/deactivate
 * Body: { reason: "sticker rusak" }
 */
export const deactivateQR = async (req, res) => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    const bundle = await prisma.batchGradeBundle.findUnique({
      where: { qr_token: token },
      select: { id: true },
    });

    if (!bundle) {
      return res.status(404).json({ message: "QR tidak ditemukan" });
    }

    const updated = await prisma.batchGradeBundle.update({
      where: { qr_token: token },
      data: {
        qr_is_active: false,
        deactivated_at: new Date(),
        deactivated_reason: reason || null,
      },
    });

    res.json({
      message: "QR berhasil dinonaktifkan",
      deactivated_at: updated.deactivated_at,
      deactivated_reason: updated.deactivated_reason,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET QR ACCESS LOG
 *
 * GET /api/qr/:token/logs
 */
export const getQRLogs = async (req, res) => {
  try {
    const { token } = req.params;

    const bundle = await prisma.batchGradeBundle.findUnique({
      where: { qr_token: token },
      select: { id: true },
    });

    if (!bundle) {
      return res.status(404).json({ message: "QR tidak ditemukan" });
    }

    const logs = await prisma.bundleQRAccessLog.findMany({
      where: { bundle_id: bundle.id },
      orderBy: { accessed_at: "desc" },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Helper ───────────────────────────────────────────
const getDeviceType = (userAgent = "") => {
  if (!userAgent) return "unknown";
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
};