// src/modules/projects/project.routes.js
import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./project.controller.js";
import { requireAuth } from "../../middleware/auth.js";

export const projectRouter = Router();

projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.post("/", requireAuth, createProject);
projectRouter.put("/:id", requireAuth, updateProject);
projectRouter.delete("/:id", requireAuth, deleteProject);
