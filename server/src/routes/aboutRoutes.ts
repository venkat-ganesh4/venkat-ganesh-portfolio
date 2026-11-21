import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

const ABOUT_KEY = "main";

const editableFields = [
  "pageTitle",
  "headline",
  "intro",
  "whoIAm",
  "whatIExplore",
  "beyondTech",
  "myDirection",
  "profileImage",
] as const;

function validateAboutData(body: Record<string, unknown>) {
  for (const field of editableFields) {
    const value = body[field];

    if (
      value !== undefined &&
      value !== null &&
      typeof value !== "string"
    ) {
      return false;
    }
  }

  return true;
}

function getAboutData(body: Record<string, unknown>) {
  const data: Record<string, string | null> = {};

  for (const field of editableFields) {
    if (body[field] !== undefined) {
      data[field] =
        typeof body[field] === "string" ? body[field] as string : null;
    }
  }

  return data;
}

// Public: fetch About page content only when published
publicRouter.get("/", async (_req, res) => {
  try {
    const about = await prisma.aboutContent.findUnique({
      where: { key: ABOUT_KEY },
    });

    if (!about || !about.published) {
      res.status(404).json({
        success: false,
        message: "About page is not available",
      });
      return;
    }

    res.json({ success: true, about });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch About content",
    });
  }
});

// Admin: fetch About content, including unpublished content
adminRouter.get("/", async (_req, res) => {
  try {
    const about = await prisma.aboutContent.findUnique({
      where: { key: ABOUT_KEY },
    });

    res.json({ success: true, about });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch About content",
    });
  }
});

// Admin: create or update the single About page record
adminRouter.put("/", async (req, res) => {
  try {
    const body = req.body ?? {};

    if (
      typeof body !== "object" ||
      Array.isArray(body) ||
      !validateAboutData(body)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid About content",
      });
      return;
    }

    if (
      body.published !== undefined &&
      typeof body.published !== "boolean"
    ) {
      res.status(400).json({
        success: false,
        message: "Published must be a boolean",
      });
      return;
    }

    const data = {
      ...getAboutData(body),
      ...(body.published !== undefined && {
        published: body.published,
      }),
    };

    const about = await prisma.aboutContent.upsert({
      where: { key: ABOUT_KEY },
      create: {
        key: ABOUT_KEY,
        ...data,
        published: body.published === true,
      },
      update: data,
    });

    res.json({
      success: true,
      message: "About content saved successfully",
      about,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not save About content",
    });
  }
});

export { publicRouter as aboutPublicRoutes, adminRouter as aboutAdminRoutes };