// src/modules/contact/contact.schema.js
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  whatsapp: z.string().optional(),
  message: z.string().min(10, "Ceritakan kebutuhanmu sedikit lebih detail"),
  isRead: z.boolean().optional(),
});
