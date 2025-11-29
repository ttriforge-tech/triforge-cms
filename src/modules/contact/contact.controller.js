// src/modules/contact/contact.controller.js
import { prisma } from "../../config/db.js";
import { contactSchema } from "./contact.schema.js";

// CREATE pesan dari website (public, isRead selalu false)
export async function createContactMessage(req, res) {
  try {
    const parsed = contactSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    const created = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp ?? null,
        message: data.message,
        // 🔹 isRead tidak di-override, biarkan default(false)
      },
    });

    return res.status(201).json({
      message: "Pesan terkirim",
      id: created.id,
    });
  } catch (err) {
    console.error("Create contact message error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// LIST semua pesan (admin)
export async function listContactMessages(req, res) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json(messages);
  } catch (err) {
    console.error("List contact messages error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// DETAIL satu pesan
export async function getContactMessage(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const msg = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!msg) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    return res.json(msg);
  } catch (err) {
    console.error("Get contact message error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// UPDATE pesan (koreksi + set isRead)
export async function updateContactMessage(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    // semua field optional (name, email, whatsapp, message, isRead)
    const parsed = contactSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // 🔹 build payload update secara aman (supaya false tetap kepakai)
    const updatePayload = {};

    if (data.name !== undefined) {
      updatePayload.name = data.name;
    }
    if (data.email !== undefined) {
      updatePayload.email = data.email;
    }
    if (data.whatsapp !== undefined) {
      updatePayload.whatsapp = data.whatsapp;
    }
    if (data.message !== undefined) {
      updatePayload.message = data.message;
    }
    if (typeof data.isRead === "boolean") {
      updatePayload.isRead = data.isRead; // false juga disimpan
    }

    if (Object.keys(updatePayload).length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada field yang diupdate." });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: updatePayload,
    });

    return res.json(updated);
  } catch (err) {
    console.error("Update contact message error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE pesan
export async function deleteContactMessage(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    await prisma.contactMessage.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    console.error("Delete contact message error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
