import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { prisma } from "../src/lib/prisma.js";
import {
  generateQRToken,
  generateQRUrl,
  generateQRImageToFile,
} from "../src/lib/qrGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder penyimpanan file QR — uploads/qr/ di root project
const QR_FOLDER = path.join(__dirname, "../uploads/qr");

// Pastikan folder ada saat module pertama kali diload
if (!fs.existsSync(QR_FOLDER)) {
  fs.mkdirSync(QR_FOLDER, { recursive: true });
}

/**
 * SORTIR BATCH → GENERATE BUNDLE PER GRADE
 *
 * Dipanggil otomatis saat batch di-close.
 * Mengambil semua GradingResult dari batch,
 * mengelompokkan per grade, lalu membuat BatchGradeBundle
 * dengan QR token unik + file PNG untuk masing-masing grade.
 *
 * @param {string} batchId
 * @returns {Promise<BatchGradeBundle[]>}
 */
export const generateBundlesFromBatch = async (batchId) => {
  // 1. Ambil batch beserta info petani dan semua grading result-nya
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      farmer: true,
      gradings: true,
    },
  });

  if (!batch) throw new Error("Batch tidak ditemukan");
  if (batch.status !== "CLOSED") throw new Error("Batch harus berstatus CLOSED sebelum di-sortir");
  if (!batch.gradings || batch.gradings.length === 0) throw new Error("Batch tidak memiliki grading result");

  // 2. Kelompokkan grading result berdasarkan grade
  const groupedByGrade = batch.gradings.reduce((acc, grading) => {
    const grade = grading.grade;
    if (!grade) return acc;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(grading);
    return acc;
  }, {});

  const grades = Object.keys(groupedByGrade);

  if (grades.length === 0) throw new Error("Tidak ada grading result dengan grade valid");

  // 3. Buat bundle untuk setiap grade dalam satu transaksi
  const bundles = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const grade of grades) {
      const gradingList = groupedByGrade[grade];

      // Hitung agregasi
      const totalFruits = gradingList.length;
      const totalWeight = gradingList.reduce((sum, g) => sum + (g.weight_estimate || 0), 0);

      // Cek apakah bundle sudah ada (untuk kasus re-close)
      const existingBundle = await tx.batchGradeBundle.findUnique({
        where: { batch_id_grade: { batch_id: batchId, grade } },
      });

      let qrToken, qrUrl, qrImagePath;

      if (existingBundle) {
        // Pakai QR lama — sticker fisik yang sudah dicetak tetap valid
        qrToken = existingBundle.qr_token;
        qrUrl = existingBundle.qr_url;
        qrImagePath = existingBundle.qr_image_path;
      } else {
        // Generate QR baru
        qrToken = generateQRToken();
        qrUrl = generateQRUrl(qrToken);

        // Simpan file PNG ke uploads/qr/
        const filePath = path.join(QR_FOLDER, `${qrToken}.png`);
        await generateQRImageToFile(qrUrl, filePath);

        // Path publik yang bisa diakses via browser
        qrImagePath = `/uploads/qr/${qrToken}.png`;
      }

      // Upsert bundle
      const bundle = await tx.batchGradeBundle.upsert({
        where: {
          batch_id_grade: { batch_id: batchId, grade },
        },
        create: {
          batch_id: batchId,
          grade,
          total_fruits: totalFruits,
          total_weight: totalWeight > 0 ? totalWeight : null,

          // Cache info publik
          fruit_type: batch.fruit_type,
          harvest_date: batch.harvest_date,
          farmer_name: batch.farmer?.name || null,
          origin_village: batch.farmer?.village || null,
          origin_city: batch.farmer?.city || null,
          sorted_at: new Date(),

          qr_token: qrToken,
          qr_url: qrUrl,
          qr_image_path: qrImagePath,
          qr_is_active: true,
        },
        update: {
          total_fruits: totalFruits,
          total_weight: totalWeight > 0 ? totalWeight : null,
          sorted_at: new Date(),
        },
      });

      // Hubungkan GradingResult ke bundle ini
      await tx.gradingResult.updateMany({
        where: { id: { in: gradingList.map((g) => g.id) } },
        data: { bundle_id: bundle.id },
      });

      results.push(bundle);
    }

    return results;
  });

  return bundles;
};

/**
 * AMBIL SEMUA BUNDLE DARI SATU BATCH
 * Untuk dashboard internal
 */
export const getBundlesByBatch = async (batchId) => {
  return prisma.batchGradeBundle.findMany({
    where: { batch_id: batchId },
    include: {
      grading_results: {
        select: {
          id: true,
          grading_code: true,
          grade: true,
          confidence_avg: true,
          color_score: true,
          texture_score: true,
          defect_score: true,
          size_score: true,
          weight_estimate: true,
          grading_method: true,
          image_urls: true,
          createdAt: true,
        },
      },
      printed_by: {
        select: { id: true, name: true },
      },
    },
    orderBy: { grade: "asc" },
  });
};

/**
 * AMBIL BUNDLE BY QR TOKEN
 * Untuk halaman publik — info ringkas + catat log akses
 */
export const getBundleByToken = async (token, logData = {}) => {
  const bundle = await prisma.batchGradeBundle.findUnique({
    where: { qr_token: token },
    select: {
      id: true,
      grade: true,
      total_fruits: true,
      total_weight: true,
      fruit_type: true,
      harvest_date: true,
      farmer_name: true,
      origin_village: true,
      origin_city: true,
      sorted_at: true,
      qr_is_active: true,
      qr_image_path: true,
      batch: {
        select: { lot_code: true },
      },
    },
  });

  if (!bundle) return null;

  // Catat akses ke log
  await prisma.bundleQRAccessLog.create({
    data: {
      bundle_id: bundle.id,
      device_type: logData.device_type || null,
      ip_address: logData.ip_address || null,
      user_agent: logData.user_agent || null,
    },
  });

  return bundle;
};