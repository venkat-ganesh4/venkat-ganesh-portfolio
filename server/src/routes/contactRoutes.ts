
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const publicRouter = Router();
const adminRouter = Router();

const DEFAULT_CONTACT = {
  pageTitle: "Let's Connect",
  headline: "Have an idea or opportunity?",
  introduction:
    "I'm always open to interesting conversations, collaborations, and opportunities.",
  availability: "",
  location: "",
  showContactForm: true,
  contactItems: [],
  socialLinks: [],
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// Public: retrieve contact settings
publicRouter.get("/", async (_req, res) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "contact" },
    });

    res.json({
      success: true,
      content: setting?.value ?? DEFAULT_CONTACT,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not load contact information",
    });
  }
});

// Public: submit a contact message
publicRouter.post("/messages", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
      return;
    }

    if (
      name.length > 100 ||
      email.length > 254 ||
      message.length > 5000 ||
      (subject != null &&
        (typeof subject !== "string" || subject.length > 200))
    ) {
      res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
      return;
    }

    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        subject:
          typeof subject === "string" ? subject.trim() || null : null,
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not submit your message",
    });
  }
});

// Admin: retrieve all contact messages
adminRouter.get("/messages", requireAdmin, async (_req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, messages });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not load contact messages",
    });
  }
});

// Admin: update message status
adminRouter.patch("/messages/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body ?? {};

    if (
      typeof status !== "string" ||
      !["unread", "read", "replied", "archived"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid message status",
      });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
      return;
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, message: updatedMessage });
  } catch {
    res.status(404).json({
      success: false,
      message: "Contact message not found",
    });
  }
});

// Admin: delete a contact message
adminRouter.delete("/messages/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
      return;
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch {
    res.status(404).json({
      success: false,
      message: "Contact message not found",
    });
  }
});

// Admin: retrieve contact settings
adminRouter.get("/settings", requireAdmin, async (_req, res) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "contact" },
    });

    res.json({
      success: true,
      content: setting?.value ?? DEFAULT_CONTACT,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not load contact settings",
    });
  }
});

// Admin: save contact settings
adminRouter.put("/settings", requireAdmin, async (req, res) => {
  try {
    const value = req.body?.value;

    if (!isObject(value)) {
      res.status(400).json({
        success: false,
        message: "Contact settings must be a JSON object",
      });
      return;
    }

    const jsonValue = JSON.parse(JSON.stringify(value));

    const setting = await prisma.siteSettings.upsert({
      where: { key: "contact" },
      create: { key: "contact", value: jsonValue },
      update: { value: jsonValue },
    });

    res.json({
      success: true,
      content: setting.value,
      message: "Contact settings saved successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not save contact settings",
    });
  }
});

export {
  publicRouter as contactPublicRoutes,
  adminRouter as contactAdminRoutes,
};
