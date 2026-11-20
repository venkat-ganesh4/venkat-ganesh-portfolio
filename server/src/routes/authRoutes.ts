
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_COOKIE,
  SESSION_DURATION,
} from "../lib/auth.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password format",
      });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateSessionToken();

    await prisma.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        adminId: admin.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION),
      },
    });

    res.cookie(SESSION_COOKIE, token, {
      ...cookieOptions,
      maxAge: SESSION_DURATION,
    });

    return res.json({
      success: true,
      message: "Login successful",
      admin: { id: admin.id, email: admin.email },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAdmin, async (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];

    if (token) {
      await prisma.session.deleteMany({
        where: { tokenHash: hashSessionToken(token) },
      });
    }

    res.clearCookie(SESSION_COOKIE, cookieOptions);

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAdmin, async (req, res) => {
  res.json({
    success: true,
    adminId: req.adminId,
  });
});

export default router;
