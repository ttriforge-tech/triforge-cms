// src/modules/users/user.schema.js
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter").optional(),
});

export const updateUserSchema = z
  .object({
    email: z.string().email("Email tidak valid").optional(),
    password: z.string().min(6, "Password minimal 6 karakter").optional(),
    name: z.string().min(2, "Nama minimal 2 karakter").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });
