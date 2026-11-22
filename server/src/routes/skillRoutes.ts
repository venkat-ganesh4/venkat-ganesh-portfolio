
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

// PUBLIC: Get published skills grouped by category
publicRouter.get("/", async (_req, res) => {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        skills: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });

    res.json({
      success: true,
      categories: categories
        .map((category) => ({
          ...category,
          skills: category.skills,
        }))
        .filter((category) => category.skills.length > 0),
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch skills",
    });
  }
});

// ADMIN: Get all categories and skills
adminRouter.get("/", async (_req, res) => {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        skills: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });

    res.json({ success: true, categories });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch skills",
    });
  }
});

// ADMIN: Create category
adminRouter.post("/categories", async (req, res) => {
  try {
    const { name } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });
      return;
    }

    const category = await prisma.skillCategory.create({
      data: {
        name: name.trim(),
        sortOrder: Number.isInteger(req.body.sortOrder)
          ? req.body.sortOrder
          : 0,
      },
    });

    res.status(201).json({ success: true, category });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not create category",
    });
  }
});

// ADMIN: Update category
adminRouter.put("/categories/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const { name, sortOrder } = req.body ?? {};

    const existing = await prisma.skillCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    if (
      (name !== undefined &&
        (typeof name !== "string" || !name.trim())) ||
      (sortOrder !== undefined && !Number.isInteger(sortOrder))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid category data",
      });
      return;
    }

    const category = await prisma.skillCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json({ success: true, category });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not update category",
    });
  }
});

// ADMIN: Delete category (its skills are cascade-deleted)
adminRouter.delete("/categories/:id", async (req, res) => {
  try {
    await prisma.skillCategory.delete({
      where: { id: String(req.params.id) },
    });

    res.json({
      success: true,
      message: "Category and its skills deleted",
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }
});

// ADMIN: Create skill
adminRouter.post("/", async (req, res) => {
  try {
    const { name, categoryId } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof categoryId !== "string" ||
      !categoryId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Skill name and category are required",
      });
      return;
    }

    const category = await prisma.skillCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400).json({
        success: false,
        message: "Selected category does not exist",
      });
      return;
    }

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        categoryId,
        sortOrder: Number.isInteger(req.body.sortOrder)
          ? req.body.sortOrder
          : 0,
      },
    });

    res.status(201).json({ success: true, skill });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not create skill",
    });
  }
});

// ADMIN: Update skill
adminRouter.put("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const { name, categoryId, sortOrder } = req.body ?? {};

    const existing = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    if (
      (name !== undefined &&
        (typeof name !== "string" || !name.trim())) ||
      (categoryId !== undefined &&
        (typeof categoryId !== "string" || !categoryId.trim())) ||
      (sortOrder !== undefined && !Number.isInteger(sortOrder))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid skill data",
      });
      return;
    }

    if (categoryId !== undefined) {
      const category = await prisma.skillCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        res.status(400).json({
          success: false,
          message: "Selected category does not exist",
        });
        return;
      }
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(categoryId !== undefined && { categoryId }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json({ success: true, skill });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not update skill",
    });
  }
});

// ADMIN: Delete skill
adminRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.skill.delete({
      where: { id: String(req.params.id) },
    });

    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "Skill not found",
    });
  }
});

export { publicRouter as skillPublicRoutes, adminRouter as skillAdminRoutes };
