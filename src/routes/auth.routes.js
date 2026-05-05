import express from "express";
import {
  register,
  login,
  logout,
  me,
  refreshToken,
  changePassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ── Public routes ──
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// ── Protected routes ──
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);
router.put("/change-password", authenticate, changePassword);

export default router;