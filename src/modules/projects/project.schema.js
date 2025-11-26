// src/modules/projects/project.schema.js
import { z } from "zod";

export const projectCreateSchema = z.object({
  segment: z.string().min(1, "Segment wajib diisi"), // slug segment
  category: z.string().min(2, "Kategori wajib diisi"),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  result: z.string().min(5, "Result minimal 5 karakter"),
  details: z.string().min(5, "Details minimal 5 karakter"),
  tags: z.array(z.string()).optional(),
  image: z.string().url("URL gambar tidak valid").optional(),
  imageAlt: z.string().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();
