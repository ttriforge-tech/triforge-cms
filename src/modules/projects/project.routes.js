// src/modules/projects/project.routes.js
import { Router } from "express";
import multer from "multer";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./project.controller.js";
import { requireAuth } from "../../middleware/auth.js";

export const projectRouter = Router();

// ==========================
// Multer config (memory)
// ==========================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB, bisa kamu ubah
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar"), false);
    }
    cb(null, true);
  },
});

// ==========================
// Routes
// ==========================
projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);

// CREATE: pakai upload.single("image")
projectRouter.post("/", requireAuth, upload.single("image"), createProject);

// UPDATE: bisa kirim gambar baru (opsional)
projectRouter.put("/:id", requireAuth, upload.single("image"), updateProject);

projectRouter.delete("/:id", requireAuth, deleteProject);
