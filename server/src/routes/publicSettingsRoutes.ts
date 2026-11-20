import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/homepage", async (_req, res) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "homepage" },
    });

    res.json({
      success: true,
      content: setting?.value ?? null,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Could not fetch homepage content",
    });
  }
});

export default router;