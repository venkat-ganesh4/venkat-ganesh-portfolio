
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

// Public: published projects
publicRouter.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, projects });
  } catch {
    res.status(500).json({ success: false, message: "Could not fetch projects" });
  }
});

// Admin: all projects
adminRouter.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, projects });
  } catch {
    res.status(500).json({ success: false, message: "Could not fetch projects" });
  }
});

// Admin: create project
adminRouter.post("/", async (req, res) => {
  try {
    const body = req.body ?? {};
    const { title, slug, summary } = body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof slug !== "string" || !slug.trim() ||
      typeof summary !== "string" || !summary.trim()
    ) {
      res.status(400).json({ success: false, message: "Title, slug, and summary are required" });
      return;
    }

    if (
      (body.techStack !== undefined && (!Array.isArray(body.techStack) || !body.techStack.every((v: unknown) => typeof v === "string"))) ||
      (body.galleryImages !== undefined && (!Array.isArray(body.galleryImages) || !body.galleryImages.every((v: unknown) => typeof v === "string")))
    ) {
      res.status(400).json({ success: false, message: "Tech stack and gallery images must be arrays of strings" });
      return;
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        description: typeof body.description === "string" ? body.description : "",
        category: typeof body.category === "string" ? body.category : null,
        coverImage: typeof body.coverImage === "string" ? body.coverImage : null,
        galleryImages: body.galleryImages ?? [],
        githubUrl: typeof body.githubUrl === "string" ? body.githubUrl : null,
        liveUrl: typeof body.liveUrl === "string" ? body.liveUrl : null,
        techStack: body.techStack ?? [],
        featured: body.featured === true,
        published: body.published === true,
        sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
      },
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(409).json({ success: false, message: "A project with this slug already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Could not create project" });
  }
});

// Admin: update project
adminRouter.put("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const body = req.body ?? {};
    const existing = await prisma.project.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    if (
      (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) ||
      (body.slug !== undefined && (typeof body.slug !== "string" || !body.slug.trim())) ||
      (body.summary !== undefined && (typeof body.summary !== "string" || !body.summary.trim())) ||
      (body.techStack !== undefined && (!Array.isArray(body.techStack) || !body.techStack.every((v: unknown) => typeof v === "string"))) ||
      (body.galleryImages !== undefined && (!Array.isArray(body.galleryImages) || !body.galleryImages.every((v: unknown) => typeof v === "string")))
    ) {
      res.status(400).json({ success: false, message: "Invalid project data" });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.slug !== undefined && { slug: body.slug.trim() }),
        ...(body.summary !== undefined && { summary: body.summary.trim() }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.galleryImages !== undefined && { galleryImages: body.galleryImages }),
        ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl }),
        ...(body.liveUrl !== undefined && { liveUrl: body.liveUrl }),
        ...(body.techStack !== undefined && { techStack: body.techStack }),
        ...(body.featured !== undefined && { featured: body.featured === true }),
        ...(body.published !== undefined && { published: body.published === true }),
        ...(body.sortOrder !== undefined && Number.isInteger(body.sortOrder) && { sortOrder: body.sortOrder }),
      },
    });

    res.json({ success: true, project });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(409).json({ success: false, message: "A project with this slug already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Could not update project" });
  }
});

// Admin: delete project
adminRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }
    res.status(500).json({ success: false, message: "Could not delete project" });
  }
});

export { publicRouter as projectPublicRoutes, adminRouter as projectAdminRoutes };