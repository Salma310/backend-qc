import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// ─────────────────────────────────────────
// Helper: generate tokens
// ─────────────────────────────────────────
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: role ?? "QC",
        phone: phone ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        is_active: true,
        createdAt: true,
      },
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      message: "User registered successfully.",
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    console.error("ERROR REGISTER:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, client } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    if (client === 'web' && !['ADMIN', 'MANAGER'].includes(user.role)) {
      return res.status(403).json({ message: "Akses login web hanya untuk role ADMIN dan MANAGER." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const { accessToken, refreshToken } = generateTokens(user);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active,
    };

    res.json({
      message: "Login successful.",
      data: { user: userData, accessToken, refreshToken },
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token." });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        is_active: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "User not found or deactivated." });
    }

    const tokens = generateTokens(user);

    res.json({
      message: "Token refreshed.",
      data: tokens,
    });
  } catch (error) {
    console.error("ERROR REFRESH TOKEN:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        is_active: true,
        last_login_at: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ data: user });
  } catch (error) {
    console.error("ERROR ME:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────
export const logout = (_req, res) => {
  res.json({ message: "Logged out successfully." });
};

// ─────────────────────────────────────────
// PUT /api/auth/change-password
// ─────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    });

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("ERROR CHANGE PASSWORD:", error);
    res.status(500).json({ message: error.message });
  }
};