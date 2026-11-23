
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

// PUBLIC: Get published experiences
publicRouter.get("/", async (_req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      where: { published: true },
      orderBy: [
        { sortOrder: "asc" },
        { startDate: "desc" },
      ],
    });

    res.json({ success: true, experiences });
  } catch (error) {
    console.error("Fetch public experiences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch experiences",
    });
  }
});

// ADMIN: Get all experiences
adminRouter.get("/", async (_req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { startDate: "desc" },
      ],
    });

    res.json({ success: true, experiences });
  } catch (error) {
    console.error("Fetch admin experiences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch experiences",
    });
  }
});

// ADMIN: Create experience
adminRouter.post("/", async (req, res) => {
  try {
    const {
      company,
      role,
      location,
      employmentType,
      startDate,
      endDate,
      current,
      description,
      responsibilities,
      technologies,
      sortOrder,
      published,
    } = req.body;

    if (!company?.trim() || !role?.trim() || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Company, role, and start date are required",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (parsedEndDate && parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const experience = await prisma.experience.create({
      data: {
        company: company.trim(),
        role: role.trim(),
        location: location?.trim() || null,
        employmentType: employmentType?.trim() || null,
        startDate: parsedStartDate,
        endDate: current ? null : parsedEndDate,
        current: Boolean(current),
        description: description?.trim() || "",
        responsibilities: normalizeArray(responsibilities),
        technologies: normalizeArray(technologies),
        sortOrder: Number(sortOrder) || 0,
        published: Boolean(published),
      },
    });

    res.status(201).json({ success: true, experience });
  } catch (error) {
    console.error("Create experience error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create experience",
    });
  }
});

// ADMIN: Update experience
adminRouter.put("/:id", async (req, res) => {
  try {
    const {
      company,
      role,
      location,
      employmentType,
      startDate,
      endDate,
      current,
      description,
      responsibilities,
      technologies,
      sortOrder,
      published,
    } = req.body;

    if (!company?.trim() || !role?.trim() || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Company, role, and start date are required",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (parsedEndDate && parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: {
        company: company.trim(),
        role: role.trim(),
        location: location?.trim() || null,
        employmentType: employmentType?.trim() || null,
        startDate: parsedStartDate,
        endDate: current ? null : parsedEndDate,
        current: Boolean(current),
        description: description?.trim() || "",
        responsibilities: normalizeArray(responsibilities),
        technologies: normalizeArray(technologies),
        sortOrder: Number(sortOrder) || 0,
        published: Boolean(published),
      },
    });

    res.json({ success: true, experience });
  } catch (error) {
    console.error("Update experience error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update experience",
    });
  }
});

// ADMIN: Delete experience
adminRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.experience.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete experience",
    });
  }
});

export { publicRouter as experiencePublicRoutes, adminRouter as experienceAdminRoutes };
