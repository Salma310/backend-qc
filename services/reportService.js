import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

import {
  generateReportHtml
} from "../templates/reportTemplate.js";

const toValidDate = (value, fieldName) => {
  const date = value instanceof Date
    ? value
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid report ${fieldName}`);
  }

  return date;
};

export const generateReportPdf = async (
  report,
  reportType
) => {

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const logoPath = path.join(
    process.cwd(),
    "assets",
    "logo.png"
  );

  const logoBase64 =
  fs.readFileSync(logoPath, {
    encoding: "base64",
  });

  const html =
    generateReportHtml(
      report,
      reportType,
      logoBase64
    ).replace(
      "LOGO_PATH",
      logoPath.replace(/\\/g, "/")
    );

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const outputDir = path.join(
    process.cwd(),
    "uploads",
    "reports"
  );

  fs.mkdirSync(outputDir, {
    recursive: true,
  });

  const startDate = toValidDate(
    report.period_start,
    "period_start"
  );

  const endDate = toValidDate(
    report.period_end,
    "period_end"
  );

  let filename;

  if (reportType === "MONTHLY") {
    const month = startDate.toLocaleString("en-US", {
      month: "long",
    });

    const year = startDate.getFullYear();

    filename = `QC_Report_${month}_${year}.pdf`;
  } else {
    const month = endDate.toLocaleString("en-US", {
      month: "long",
    });

    const year = endDate.getFullYear();

    const weekOfMonth = Math.ceil(
      endDate.getDate() / 7
    );

    filename = `QC_Weekly_Report_Week${weekOfMonth}_${month}_${year}.pdf`;
  }

  const pdfPath = path.join(
    outputDir,
    filename
  );

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  await browser.close();

  return pdfPath;
};
