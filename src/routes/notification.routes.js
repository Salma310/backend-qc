import express from "express";
import {
  getAllNotification,
  createNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", getAllNotification);

router.post("/", createNotification);

export default router;