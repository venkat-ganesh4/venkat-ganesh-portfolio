
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

const allowedEvents = [
  "page_view",
  "click",
  "resume_download",
  "contact_click",
  "project_view",
  "section_view",
];

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

// Public endpoint: record anonymous visitor activity.
router.post("/events", async (req, res) => {
  try {
    const visitorId = cleanString(req.body.visitorId, 100);
    const eventType = cleanString(req.body.eventType, 40);
    const pagePath = cleanString(req.body.pagePath, 300);

    if (
      !visitorId ||
      !eventType ||
      !pagePath ||
      !allowedEvents.includes(eventType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid analytics event",
      });
    }

    await prisma.analyticsEvent.create({
      data: {
        visitorId,
        sessionId: cleanString(req.body.sessionId, 100),
        eventType,
        pagePath,
        target: cleanString(req.body.target, 200),
        source: cleanString(req.body.source, 200),
        deviceType: ["desktop", "mobile", "tablet"].includes(req.body.deviceType)
          ? req.body.deviceType
          : null,
      },
    });

    return res.status(201).json({ success: true });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not record analytics event",
    });
  }
});

// Protected endpoint: retrieve analytics for the admin dashboard.
router.get("/overview", requireAdmin, async (req, res) => {
  try {
    const requestedDays = Number(req.query.days ?? 7);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where = {
      createdAt: { gte: startDate },
    };

    const [
      totalEvents,
      pageViews,
      uniqueVisitors,
      pageGroups,
      clickGroups,
      deviceGroups,
      dailyGroups,
      downloadCount,
      contactCount,
      sourceGroups,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where }),

      prisma.analyticsEvent.count({
        where: { ...where, eventType: "page_view" },
      }),

      prisma.analyticsEvent.findMany({
        where,
        distinct: ["visitorId"],
        select: { visitorId: true },
      }),

      prisma.analyticsEvent.groupBy({
        by: ["pagePath"],
        where: { ...where, eventType: "page_view" },
        _count: { _all: true },
        orderBy: { _count: { pagePath: "desc" } },
        take: 10,
      }),

      prisma.analyticsEvent.groupBy({
        by: ["target"],
        where: { ...where, eventType: "click", target: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { target: "desc" } },
        take: 10,
      }),

      prisma.analyticsEvent.groupBy({
        by: ["deviceType"],
        where: { ...where, deviceType: { not: null } },
        _count: { _all: true },
      }),

      prisma.analyticsEvent.groupBy({
        by: ["createdAt"],
        where: { ...where, eventType: "page_view" },
        _count: { _all: true },
      }),

      prisma.analyticsEvent.count({
        where: { ...where, eventType: "resume_download" },
      }),

      prisma.analyticsEvent.count({
        where: { ...where, eventType: "contact_click" },
      }),

      prisma.analyticsEvent.groupBy({
        by: ["source"],
        where: { ...where, source: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { source: "desc" } },
        take: 10,
      }),
    ]);

    const dailyMap = new Map<string, number>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dailyMap.set(date.toISOString().slice(0, 10), 0);
    }

    for (const item of dailyGroups) {
      const day = item.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + item._count._all);
    }

    return res.json({
      success: true,
      range: days,
      overview: {
        totalEvents,
        pageViews,
        uniqueVisitors: uniqueVisitors.length,
        resumeDownloads: downloadCount,
        contactClicks: contactCount,
      },
      visitorsByDay: Array.from(dailyMap, ([date, visitors]) => ({
        date,
        visitors,
      })),
      popularPages: pageGroups.map((item) => ({
        page: item.pagePath,
        views: item._count._all,
      })),
      popularClicks: clickGroups.map((item) => ({
        target: item.target,
        clicks: item._count._all,
      })),
      devices: deviceGroups.map((item) => ({
        device: item.deviceType,
        events: item._count._all,
      })),
      trafficSources: sourceGroups.map((item) => ({
        source: item.source,
        events: item._count._all,
      })),
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load analytics",
    });
  }
});

export default router;
