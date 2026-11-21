import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

// Public: published hobbies
publicRouter.get("/", async (_req, res) => {
  try {
    const hobbies = await prisma.hobby.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    res.json({ success: true, hobbies });
  } catch {
    res.status(500).json({ success: false, message: "Could not fetch hobbies" });
  }
});

// Admin: all hobbies
adminRouter.get("/", async (_req, res) => {
  try {
    const hobbies = await prisma.hobby.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    res.json({ success: true, hobbies });
  } catch {
    res.status(500).json({ success: false, message: "Could not fetch hobbies" });
  }
});

// Admin: create hobby
adminRouter.post("/", async (req, res) => {
  try {
    const body = req.body ?? {};
    const { title, slug, summary } = body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof slug !== "string" || !slug.trim() ||
      typeof summary !== "string" || !summary.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Title, slug, and summary are required",
      });
      return;
    }

    if (
      (body.galleryImages !== undefined &&
        (!Array.isArray(body.galleryImages) ||
          !body.galleryImages.every((v: unknown) => typeof v === "string")))
    ) {
      res.status(400).json({
        success: false,
        message: "Gallery images must be an array of strings",
      });
      return;
    }

    const hobby = await prisma.hobby.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        description: typeof body.description === "string" ? body.description : "",
        category: typeof body.category === "string" ? body.category : null,
        coverImage: typeof body.coverImage === "string" ? body.coverImage : null,
        galleryImages: body.galleryImages ?? [],
        published: body.published === true,
        sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
      },
    });

    res.status(201).json({ success: true, hobby });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        success: false,
        message: "A hobby with this slug already exists",
      });
      return;
    }

    res.status(500).json({ success: false, message: "Could not create hobby" });
  }
});

// Admin: update hobby
adminRouter.put("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const body = req.body ?? {};

    const existing = await prisma.hobby.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: "Hobby not found" });
      return;
    }

    if (
      (body.title !== undefined &&
        (typeof body.title !== "string" || !body.title.trim())) ||
      (body.slug !== undefined &&
        (typeof body.slug !== "string" || !body.slug.trim())) ||
      (body.summary !== undefined &&
        (typeof body.summary !== "string" || !body.summary.trim())) ||
      (body.galleryImages !== undefined &&
        (!Array.isArray(body.galleryImages) ||
          !body.galleryImages.every((v: unknown) => typeof v === "string")))
    ) {
      res.status(400).json({ success: false, message: "Invalid hobby data" });
      return;
    }

    const hobby = await prisma.hobby.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.slug !== undefined && { slug: body.slug.trim() }),
        ...(body.summary !== undefined && { summary: body.summary.trim() }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.galleryImages !== undefined && { galleryImages: body.galleryImages }),
        ...(body.published !== undefined && { published: body.published === true }),
        ...(body.sortOrder !== undefined &&
          Number.isInteger(body.sortOrder) && { sortOrder: body.sortOrder }),
      },
    });

    res.json({ success: true, hobby });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        success: false,
        message: "A hobby with this slug already exists",
      });
      return;
    }

    res.status(500).json({ success: false, message: "Could not update hobby" });
  }
});

// Admin: delete hobby
adminRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.hobby.delete({ where: { id: String(req.params.id) } });

    res.json({ success: true, message: "Hobby deleted successfully" });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      res.status(404).json({ success: false, message: "Hobby not found" });
      return;
    }

    res.status(500).json({ success: false, message: "Could not delete hobby" });
  }
});

export { publicRouter as hobbyPublicRoutes, adminRouter as hobbyAdminRoutes };
