// src/modules/users/user.routes.js
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./user.controller.js";

export const userRouter = Router();

// Semua route user butuh login
userRouter.use(requireAuth);

userRouter.get("/", listUsers); // GET /api/users
userRouter.get("/:id", getUser); // GET /api/users/:id
userRouter.post("/", createUser); // POST /api/users
userRouter.put("/:id", updateUser); // PUT /api/users/:id
userRouter.delete("/:id", deleteUser); // DELETE /api/users/:id
