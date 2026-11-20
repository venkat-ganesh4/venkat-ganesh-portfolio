import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAdmin);

// Get all saved settings
router.get("/", async (_req, res) => {
  try {
    const settings = await prisma.siteSettings.findMany({
      orderBy: { key: "asc" },
    });

    res.json({ success: true, settings });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch settings",
    });
  }
});

// Create or update a setting
router.put("/:key", async (req, res) => {
  try {
    const key = String(req.params.key).trim();
    const value = req.body?.value;

    if (!key || key.length > 100) {
      res.status(400).json({ success: false, message: "Invalid setting key" });
      return;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      res.status(400).json({
        success: false,
        message: "Setting value must be a JSON object",
      });
      return;
    }

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      create: { key, value: JSON.parse(JSON.stringify(value)) },
      update: { value: JSON.parse(JSON.stringify(value)) },
    });

    res.json({ success: true, setting });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not save setting",
    });
  }
});

export default router;