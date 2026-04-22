import { prisma } from "../lib/prisma.js";
import { nanoid } from 'nanoid'

/**
 * Generate batch code: BTH-[LAND_CODE]-[YYYYMMDD]-[URUT]
 */
export const generateBatchCode = async (landId) => {
  // Ambil land_code
  const land = await prisma.land.findUnique({
    where: { id: landId },
    select: { land_code: true },
  });

  if (!land) throw new Error("Lahan tidak ditemukan");

  // Format tanggal
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");

  const prefix = `BTH-${land.land_code}-${dateStr}-`;

  // Hitung batch hari ini
  const count = await prisma.batch.count({
    where: {
      lot_code: { startsWith: prefix },
    },
  });

  const urut = String(count + 1).padStart(3, "0");

  return `${prefix}${urut}`;
};

/**
 * Generate grading code: G-[URUT]
 * (LEBIH RINGKAS & GA DUPLIKASI LOT CODE)
 */
export const generateGradingCode = async (batchId) => {
  // Ambil lot_code batch untuk prefix
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { lot_code: true },
  })

  if (!batch) throw new Error('Batch tidak ditemukan')

  const count = await prisma.gradingResult.count({
    where: { batch_id: batchId },
  })

  const urut = String(count + 1).padStart(3, '0')
  const unique = nanoid(4).toUpperCase() // anti race condition

  // Contoh: GRD-BTH-LND005-20260421-001-A3BX
  return `GRD-${batch.lot_code}-${urut}-${unique}`
}