
import {
  experiencePublicRoutes,
  experienceAdminRoutes,
} from "./routes/experienceRoutes.js";
import { skillPublicRoutes, skillAdminRoutes } from "./routes/skillRoutes.js";
import { aboutPublicRoutes, aboutAdminRoutes } from "./routes/aboutRoutes.js";
import { hobbyPublicRoutes, hobbyAdminRoutes } from "./routes/hobbyRoutes.js";
import { projectPublicRoutes, projectAdminRoutes } from "./routes/projectRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import publicSettingsRoutes from "./routes/publicSettingsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

app.use("/api/admin/login", loginLimiter);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Backend and database are connected",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
app.use("/api/experience", experiencePublicRoutes);
app.use("/api/admin/experience", experienceAdminRoutes);
app.use("/api/skills", skillPublicRoutes);
app.use("/api/admin/skills", skillAdminRoutes);
app.use("/api/about", aboutPublicRoutes);
app.use("/api/admin/about", aboutAdminRoutes);
app.use("/api/hobbies", hobbyPublicRoutes);
app.use("/api/admin/hobbies", hobbyAdminRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/projects", projectPublicRoutes);
app.use("/api/admin/projects", projectAdminRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/public", publicSettingsRoutes);
app.use("/api/admin/uploads", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
export default app;
