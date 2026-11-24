import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

adminRouter.use(requireAdmin);

const SETTINGS_KEY = "visitorThoughts";

type VisitorThoughtSettings = {
  acceptSubmissions: boolean;
  autoPublish: boolean;
  showCommunityThoughts: boolean;
};

const DEFAULT_SETTINGS: VisitorThoughtSettings = {
  acceptSubmissions: true,
  autoPublish: false,
  showCommunityThoughts: true,
};

async function getSettings(): Promise<VisitorThoughtSettings> {
  const record = await prisma.siteSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });

  const value =
    record?.value && typeof record.value === "object"
      ? (record.value as Record<string, unknown>)
      : {};

  return {
    acceptSubmissions:
      typeof value.acceptSubmissions === "boolean"
        ? value.acceptSubmissions
        : DEFAULT_SETTINGS.acceptSubmissions,
    autoPublish:
      typeof value.autoPublish === "boolean"
        ? value.autoPublish
        : DEFAULT_SETTINGS.autoPublish,
    showCommunityThoughts:
      typeof value.showCommunityThoughts === "boolean"
        ? value.showCommunityThoughts
        : DEFAULT_SETTINGS.showCommunityThoughts,
  };
}

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});

// PUBLIC: fetch published visitor thoughts
publicRouter.get("/", async (_req, res) => {
  try {
    const settings = await getSettings();

    if (!settings.showCommunityThoughts) {
      res.json({ success: true, thoughts: [] });
      return;
    }

    const thoughts = await prisma.visitorThought.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
      },
    });

    res.json({ success: true, thoughts });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch community thoughts",
    });
  }
});

// PUBLIC: submit a visitor thought
publicRouter.post("/", submissionLimiter, async (req, res) => {
  try {
    const settings = await getSettings();

    if (!settings.acceptSubmissions) {
      res.status(403).json({
        success: false,
        message: "Visitor submissions are currently closed",
      });
      return;
    }

    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    if (!name || name.length > 80) {
      res.status(400).json({
        success: false,
        message: "Please provide a name of 1 to 80 characters",
      });
      return;
    }

    if (!content || content.length > 2000) {
      res.status(400).json({
        success: false,
        message: "Your thought must be between 1 and 2000 characters",
      });
      return;
    }

    if (
      email &&
      (email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    const thought = await prisma.visitorThought.create({
      data: {
        name,
        content,
        email: email || null,
        published: settings.autoPublish,
      },
      select: {
        id: true,
        published: true,
      },
    });

    res.status(201).json({
      success: true,
      message: thought.published
        ? "Your thought has been published. Thank you!"
        : "Your thought has been submitted for review. Thank you!",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not submit your thought",
    });
  }
});

// ADMIN: fetch all visitor thoughts, including private email addresses
adminRouter.get("/", async (_req, res) => {
  try {
    const [thoughts, settings] = await Promise.all([
      prisma.visitorThought.findMany({
        orderBy: { createdAt: "desc" },
      }),
      getSettings(),
    ]);

    res.json({ success: true, thoughts, settings });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch visitor thoughts",
    });
  }
});

// ADMIN: read visitor-thought settings
adminRouter.get("/settings", async (_req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch visitor-thought settings",
    });
  }
});

// ADMIN: update visitor-thought settings
adminRouter.put("/settings", async (req, res) => {
  try {
    const body = req.body?.settings ?? {};

    const keys: (keyof VisitorThoughtSettings)[] = [
      "acceptSubmissions",
      "autoPublish",
      "showCommunityThoughts",
    ];

    for (const key of keys) {
      if (typeof body[key] !== "boolean") {
        res.status(400).json({
          success: false,
          message: `Setting "${key}" must be true or false`,
        });
        return;
      }
    }

    const settings: VisitorThoughtSettings = {
      acceptSubmissions: body.acceptSubmissions,
      autoPublish: body.autoPublish,
      showCommunityThoughts: body.showCommunityThoughts,
    };

    await prisma.siteSettings.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        value: JSON.parse(JSON.stringify(settings)),
      },
      update: {
        value: JSON.parse(JSON.stringify(settings)),
      },
    });

    res.json({ success: true, settings });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not save visitor-thought settings",
    });
  }
});

// ADMIN: update visitor thought
adminRouter.put("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const body = req.body ?? {};

    if (
      (body.name !== undefined &&
        (typeof body.name !== "string" ||
          !body.name.trim() ||
          body.name.trim().length > 80)) ||
      (body.content !== undefined &&
        (typeof body.content !== "string" ||
          !body.content.trim() ||
          body.content.trim().length > 2000)) ||
      (body.published !== undefined &&
        typeof body.published !== "boolean")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid visitor thought data",
      });
      return;
    }

    const thought = await prisma.visitorThought.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.content !== undefined && { content: body.content.trim() }),
        ...(body.published !== undefined && { published: body.published }),
      },
    });

    res.json({ success: true, thought });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Visitor thought not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Could not update visitor thought",
    });
  }
});

// ADMIN: delete visitor thought
adminRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.visitorThought.delete({
      where: { id: String(req.params.id) },
    });

    res.json({
      success: true,
      message: "Visitor thought deleted successfully",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Visitor thought not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Could not delete visitor thought",
    });
  }
});





export {
  publicRouter as visitorThoughtPublicRoutes,
  adminRouter as visitorThoughtAdminRoutes,
};