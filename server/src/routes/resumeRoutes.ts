
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

const RESUME_KEY = "main";

const editableFields = [
  "pageTitle",
  "headline",
  "intro",
  "pdfUrl",
  "pdfPublicId",
  "pdfFilename",
  "videoUrl",
  "videoPublicId",
  "videoFilename",
  "videoThumbnail",
] as const;

const nullableStringFields = new Set<string>([
  "pdfUrl",
  "pdfPublicId",
  "pdfFilename",
  "videoUrl",
  "videoPublicId",
  "videoFilename",
  "videoThumbnail",
]);

function validateResumeData(body: Record<string, unknown>) {
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

function getResumeData(body: Record<string, unknown>) {
  const data: Record<string, string | null> = {};

  for (const field of editableFields) {
    if (body[field] !== undefined) {
      const value = body[field];

      data[field] =
        typeof value === "string"
          ? value
          : nullableStringFields.has(field)
            ? null
            : "";
    }
  }

  return data;
}

// Public: fetch Resume content only when published
publicRouter.get("/", async (_req, res) => {
  try {
    const resume = await prisma.resumeContent.findUnique({
      where: { key: RESUME_KEY },
    });

    if (!resume || !resume.published) {
      res.status(404).json({
        success: false,
        message: "Resume page is not available",
      });
      return;
    }

    res.json({ success: true, resume });
  } catch (error) {
    console.error("Could not fetch Resume content:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch Resume content",
    });
  }
});

// Admin: fetch Resume content, including unpublished content
adminRouter.get("/", async (_req, res) => {
  try {
    const resume = await prisma.resumeContent.findUnique({
      where: { key: RESUME_KEY },
    });

    res.json({ success: true, resume });
  } catch (error) {
    console.error("Could not fetch Resume content:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch Resume content",
    });
  }
});

// Admin: create or update Resume content
adminRouter.put("/", async (req, res) => {
  try {
    const body = req.body ?? {};

    if (
      typeof body !== "object" ||
      Array.isArray(body) ||
      !validateResumeData(body)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid Resume content",
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
      ...getResumeData(body),
      ...(body.published !== undefined && {
        published: body.published,
      }),
    };

    const resume = await prisma.resumeContent.upsert({
      where: { key: RESUME_KEY },
      create: {
        key: RESUME_KEY,
        ...data,
        published: body.published === true,
      },
      update: data,
    });

    res.json({
      success: true,
      message: "Resume content saved successfully",
      resume,
    });
  } catch (error) {
    console.error("Could not save Resume content:", error);

    res.status(500).json({
      success: false,
      message: "Could not save Resume content",
    });
  }
});

export {
  publicRouter as resumePublicRoutes,
  adminRouter as resumeAdminRoutes,
};
