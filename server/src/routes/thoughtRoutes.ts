
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

export const thoughtPublicRoutes = Router();
export const thoughtAdminRoutes = Router();

thoughtPublicRoutes.get("/", async (_req, res) => {
  try {
    const thoughts = await prisma.thought.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });

    res.json({ success: true, thoughts });
  } catch (error) {
    console.error("Public thoughts error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load thoughts.",
    });
  }
});

thoughtAdminRoutes.use(requireAdmin);

thoughtAdminRoutes.get("/", async (_req, res) => {
  try {
    const thoughts = await prisma.thought.findMany({
      orderBy: { updatedAt: "desc" },
    });

    res.json({ success: true, thoughts });
  } catch (error) {
    console.error("Admin thoughts error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load your thoughts.",
    });
  }
});

thoughtAdminRoutes.post("/", async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    const published = req.body.published === true;

    if (!title || title.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Title is required and must be at most 160 characters.",
      });
    }

    if (!content || content.length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Content is required and must be at most 20,000 characters.",
      });
    }

    const thought = await prisma.thought.create({
      data: { title, content, published },
    });

    res.status(201).json({
      success: true,
      message: published ? "Thought published." : "Draft saved.",
      thought,
    });
  } catch (error) {
    console.error("Create thought error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to save this thought.",
    });
  }
});

thoughtAdminRoutes.put("/:id", async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!title || title.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Title is required and must be at most 160 characters.",
      });
    }

    if (!content || content.length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Content is required and must be at most 20,000 characters.",
      });
    }

    if (typeof req.body.published !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Publication status must be true or false.",
      });
    }

    const thought = await prisma.thought.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        published: req.body.published,
      },
    });

    res.json({
      success: true,
      message: "Thought updated.",
      thought,
    });
  } catch (error) {
    console.error("Update thought error:", error);
    const prismaError = error as { code?: string };

    if (prismaError.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Thought not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update this thought.",
    });
  }
});

thoughtAdminRoutes.delete("/:id", async (req, res) => {
  try {
    await prisma.thought.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Thought deleted.",
    });
  } catch (error) {
    console.error("Delete thought error:", error);
    const prismaError = error as { code?: string };

    if (prismaError.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Thought not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to delete this thought.",
    });
  }
});
