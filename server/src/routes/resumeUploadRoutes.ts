import { Router } from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const isPDF = file.mimetype === "application/pdf";

    const isVideo = file.mimetype.startsWith("video/");

    if (isPDF || isVideo) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and video files are allowed"));
    }
  },
});

router.post(
  "/media",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Please select a file" });
        return;
      }

      const isPDF = req.file.mimetype === "application/pdf";
      const resourceType = isPDF ? "raw" : "video";

      const originalName = req.file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const publicId = `resume/${Date.now()}-${originalName}`;

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "venkat-portfolio",
              resource_type: resourceType,
              public_id: publicId,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file!.buffer);
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Resume media upload failed:", error);

      res.status(500).json({
        error: "Resume media upload failed",
      });
    }
  }
);

export default router;