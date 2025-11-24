// src/modules/admin/admin.controller.js
import { prisma } from "../../config/db.js";

/**
 * GET /api/admin/dashboard
 * Harus lewat requireAuth (admin login)
 */
export async function getAdminDashboard(req, res) {
  try {
    // ========= 1. Data user (me) dari middleware requireAuth =========
    const me = req.user; // { id, email, name } sudah di-set di middleware

    // ========= 2. Hitung metrik dasar pakai aggregate =========
    const [projectsCount, segmentsCount, contactsCount] = await Promise.all([
      prisma.project.count(),
      prisma.segment.count(),
      prisma.contactMessage.count(),
    ]);

    // ========= 3. Projects per segment (groupBy) =========
    const projectGroup = await prisma.project.groupBy({
      by: ["segmentId"],
      _count: { _all: true },
    });

    const segmentIds = projectGroup.map((g) => g.segmentId);

    const segments = segmentIds.length
      ? await prisma.segment.findMany({
          where: { id: { in: segmentIds } },
        })
      : [];

    const projectsBySegment = projectGroup.map((g) => {
      const seg = segments.find((s) => s.id === g.segmentId);
      return {
        segmentId: g.segmentId,
        segmentSlug: seg?.slug ?? "unknown",
        segmentLabel: seg?.label ?? "Unknown",
        count: g._count._all,
      };
    });

    // ========= 4. Recent data (untuk tabel/sekilas) =========
    const [recentProjects, recentContacts] = await Promise.all([
      prisma.project.findMany({
        include: { segment: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const projectsDto = recentProjects.map((p) => ({
      id: p.id,
      segment: p.segment.slug,
      segmentLabel: p.segment.label,
      category: p.category,
      title: p.title,
      createdAt: p.createdAt,
    }));

    const contactsDto = recentContacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      whatsapp: c.whatsapp,
      message: c.message,
      createdAt: c.createdAt,
    }));

    // ========= 5. Response final “state dashboard” =========
    return res.json({
      me,
      metrics: {
        totalProjects: projectsCount,
        totalSegments: segmentsCount,
        totalContacts: contactsCount,
        projectsBySegment,
      },
      recentProjects: projectsDto,
      recentContacts: contactsDto,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
