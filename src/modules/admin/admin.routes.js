// src/modules/admin/admin.routes.js
import { Router } from "express";
import { getAdminDashboard } from "./admin.controller.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminRouter = Router();

// semua route di sini butuh login dulu
adminRouter.get("/dashboard", requireAuth, getAdminDashboard);
