import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import {
  hashSessionToken,
  SESSION_COOKIE,
} from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.[SESSION_COOKIE];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { admin: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }

      res.clearCookie(SESSION_COOKIE);
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    req.adminId = session.adminId;
    next();
  } catch (error) {
    next(error);
  }
}