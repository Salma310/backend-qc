import QRCode from "qrcode";
import { nanoid } from "nanoid";

const BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Generate unique QR token
 * Contoh hasil: "bX7kP2mNqA"
 */
export const generateQRToken = () => {
  return nanoid(10);
};

/**
 * Generate QR public URL dari token
 */
export const generateQRUrl = (token) => {
  return `${BASE_URL}/qr/${token}`;
};

/**
 * Generate QR code sebagai base64 PNG
 * Bisa langsung ditampilkan di <img src="..."> atau dikirim ke frontend
 */
export const generateQRImage = async (url) => {
  try {
    const base64 = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return base64;
  } catch (error) {
    throw new Error(`Gagal generate QR image: ${error.message}`);
  }
};

/**
 * Generate QR code langsung ke file PNG
 * Simpan ke folder uploads
 */
export const generateQRImageToFile = async (url, filePath) => {
  try {
    await QRCode.toFile(filePath, url, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
    });
    return filePath;
  } catch (error) {
    throw new Error(`Gagal generate QR file: ${error.message}`);
  }
};