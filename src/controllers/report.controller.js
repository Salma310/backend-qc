import { prisma } from "../lib/prisma.js";
import { generateReportPdf } from "../../services/reportService.js";
/**
 * Format tanggal Indonesia
 */
const formatDate = (date) => {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Build Report Helper
 */
const buildReport = async (startDate, endDate) => {
  const batches = await prisma.batch.findMany({
    where: {
      status: "CLOSED",
      closed_at: {
        gte: startDate,
        lte: endDate,
      },
    },

    include: {
      farmer: true,
      land: true,
    },

    orderBy: {
      closed_at: "desc",
    },
  });

  // ==========================
  // Farmer -> Land Grouping
  // ==========================

  const farmerMap = {};

  batches.forEach((batch) => {
    const farmerName = batch.farmer?.name || "Unknown Farmer";
    const farmerCode = batch.farmer?.farmer_code || "-";

    const landName = batch.land?.land_name || "Unknown Land";
    const landCode = batch.land?.land_code || "-";

    const fruitCount = batch.total_fruits || 0;
    const weight = batch.harvest_weight || 0;

    if (!farmerMap[farmerName]) {
      farmerMap[farmerName] = {
        farmer_name: farmerName,
        farmer_code: farmerCode,

        total_batches: 0,
        total_fruits: 0,
        total_weight: 0,

        lands: {},
      };
    }

    // Farmer Summary
    farmerMap[farmerName].total_batches += 1;
    farmerMap[farmerName].total_fruits += fruitCount;
    farmerMap[farmerName].total_weight += weight;

    // Land Summary
    if (!farmerMap[farmerName].lands[landName]) {
      farmerMap[farmerName].lands[landName] = {
        land_name: landName,
        land_code: landCode,

        total_batches: 0,
        total_fruits: 0,
        total_weight: 0,
      };
    }

    farmerMap[farmerName].lands[landName].total_batches += 1;
    farmerMap[farmerName].lands[landName].total_fruits += fruitCount;
    farmerMap[farmerName].lands[landName].total_weight += weight;
  });

  const farmers = Object.values(farmerMap).map((farmer) => ({
    farmer_name: farmer.farmer_name,
    farmer_code: farmer.farmer_code,

    total_batches: farmer.total_batches,
    total_fruits: farmer.total_fruits,
    total_weight: Number(farmer.total_weight.toFixed(2)),

    lands: Object.values(farmer.lands).map((land) => ({
      ...land,
      total_weight: Number(land.total_weight.toFixed(2)),
    })),
  }));

  return {
    total_batches: batches.length,

    total_fruits: batches.reduce(
      (sum, batch) => sum + (batch.total_fruits || 0),
      0
    ),

    total_weight: Number(
      batches
        .reduce(
          (sum, batch) => sum + (batch.harvest_weight || 0),
          0
        )
        .toFixed(2)
    ),

    total_grade_a: batches.reduce(
      (sum, batch) => sum + (batch.total_grade_a || 0),
      0
    ),

    total_grade_b: batches.reduce(
      (sum, batch) => sum + (batch.total_grade_b || 0),
      0
    ),

    total_grade_c: batches.reduce(
      (sum, batch) => sum + (batch.total_grade_c || 0),
      0
    ),

    total_reject: batches.reduce(
      (sum, batch) => sum + (batch.total_reject || 0),
      0
    ),

    total_farmers: farmers.length,

    farmers,
  };
};

/**
 * WEEKLY REPORT
 * Last 7 Days
 */
export const getWeeklyReport = async (req, res) => {
  try {
    const endDate = new Date();

    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const report = await buildReport(
      startDate,
      endDate
    );

    res.json({
      report_type: "WEEKLY",

      period: `${formatDate(startDate)} - ${formatDate(endDate)}`,

      period_start: formatDate(startDate),
      period_end: formatDate(endDate),

      ...report,
    });
  } catch (error) {
    console.error("WEEKLY REPORT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * MONTHLY REPORT
 * Previous Full Month
 */
export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const report = await buildReport(
      startDate,
      endDate
    );
    const reportMonth = startDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    res.json({
      report_type: "MONTHLY",

      report_month: reportMonth,

      period_start: formatDate(startDate),
      period_end: formatDate(endDate),

      ...report,
    });
  } catch (error) {
    console.error("MONTHLY REPORT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * WEEKLY REPORT
 * PDF Download
 */
export const downloadWeeklyPdf = async (
  req,
  res
) => {
  try {
    const endDate = new Date();

    const startDate = new Date();

    startDate.setDate(
      endDate.getDate() - 7
    );

    const report =
      await buildReport(
        startDate,
        endDate
      );

    report.period =
      `${formatDate(startDate)} - ${formatDate(endDate)}`;

    report.period_start = startDate;
    report.period_end = endDate;

    const pdfPath =
      await generateReportPdf(
        report,
        "WEEKLY"
      );

    return res.download(pdfPath);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
};


/**
 * MONTHLY REPORT
 * PDF Download
 */
export const downloadMonthlyPdf =
  async (req, res) => {
    try {
      const now = new Date();

      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );

      const report =
        await buildReport(
          startDate,
          endDate
        );

      report.period =
        `${formatDate(startDate)} - ${formatDate(endDate)}`;

      report.period_start = startDate;
      report.period_end = endDate;

      const pdfPath =
        await generateReportPdf(
          report,
          "MONTHLY"
        );

      return res.download(pdfPath);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: err.message,
      });
    }
  };


