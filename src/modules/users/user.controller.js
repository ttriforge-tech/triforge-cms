// src/modules/users/user.controller.js
import bcrypt from "bcryptjs";
import { prisma } from "../../config/db.js";
import { createUserSchema, updateUserSchema } from "./user.schema.js";

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

// GET /api/users
export async function listUsers(req, res) {
  try {
    const { q } = req.query;

    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });

    return res.json({ data: users });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/users/:id
export async function getUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({ data: user });
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/users
export async function createUser(req, res) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
      select: userSelect,
    });

    return res.status(201).json({ data: user });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek jika email mau diubah dan sudah dipakai user lain
    if (email && email !== existing.email) {
      const emailUsed = await prisma.user.findUnique({ where: { email } });
      if (emailUsed) {
        return res
          .status(409)
          .json({ message: "Email sudah digunakan user lain" });
      }
    }

    const dataToUpdate = {};

    if (typeof email !== "undefined") dataToUpdate.email = email;
    if (typeof name !== "undefined") dataToUpdate.name = name || null;

    if (typeof password !== "undefined") {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: userSelect,
    });

    return res.json({ data: user });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
