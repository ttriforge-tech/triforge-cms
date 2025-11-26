// src/modules/projects/project.controller.js
import { prisma } from "../../config/db.js";
import { projectCreateSchema, projectUpdateSchema } from "./project.schema.js";

const mapProjectToDto = (project) => ({
  id: project.id,
  segment: project.segment.slug,
  category: project.category,
  title: project.title,
  result: project.result,
  details: project.details,
  tags: project.tags ? JSON.parse(project.tags) : [],
  image: project.image,
  imageAlt: project.imageAlt,
});

export async function listProjects(req, res) {
  try {
    const { segment } = req.query;

    const where =
      segment && segment !== "all" ? { segment: { slug: segment } } : {};

    const projects = await prisma.project.findMany({
      where,
      include: { segment: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(projects.map(mapProjectToDto));
  } catch (err) {
    console.error("List projects error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProject(req, res) {
  try {
    const id = Number(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id },
      include: { segment: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(mapProjectToDto(project));
  } catch (err) {
    console.error("Get project error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createProject(req, res) {
  try {
    const parsed = projectCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      segment,
      category,
      title,
      result,
      details,
      tags = [],
      image,
      imageAlt,
    } = parsed.data;

    const seg = await prisma.segment.findUnique({
      where: { slug: segment },
    });

    if (!seg) {
      return res.status(400).json({
        message: `Segment '${segment}' tidak ditemukan`,
      });
    }

    const created = await prisma.project.create({
      data: {
        segmentId: seg.id,
        category,
        title,
        result,
        details,
        tags: JSON.stringify(tags),
        image: image || "",
        imageAlt: imageAlt || "",
      },
      include: { segment: true },
    });

    return res.status(201).json(mapProjectToDto(created));
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProject(req, res) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }

    const parsed = projectUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    let segmentId = existing.segmentId;
    if (data.segment) {
      const seg = await prisma.segment.findUnique({
        where: { slug: data.segment },
      });
      if (!seg) {
        return res.status(400).json({
          message: `Segment '${data.segment}' tidak ditemukan`,
        });
      }
      segmentId = seg.id;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        segmentId,
        category: data.category ?? existing.category,
        title: data.title ?? existing.title,
        result: data.result ?? existing.result,
        details: data.details ?? existing.details,
        tags: data.tags ? JSON.stringify(data.tags) : existing.tags,
        image: data.image ?? existing.image,
        imageAlt: data.imageAlt ?? existing.imageAlt,
      },
      include: { segment: true },
    });

    return res.json(mapProjectToDto(updated));
  } catch (err) {
    console.error("Update project error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteProject(req, res) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.project.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    console.error("Delete project error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
