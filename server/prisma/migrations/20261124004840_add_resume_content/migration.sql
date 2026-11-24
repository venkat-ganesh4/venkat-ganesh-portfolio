-- CreateTable
CREATE TABLE "ResumeContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "pageTitle" TEXT NOT NULL DEFAULT 'My Resume',
    "headline" TEXT NOT NULL DEFAULT 'Get to know my journey',
    "intro" TEXT NOT NULL DEFAULT 'Explore my professional background and experience.',
    "pdfUrl" TEXT,
    "pdfPublicId" TEXT,
    "pdfFilename" TEXT,
    "videoUrl" TEXT,
    "videoPublicId" TEXT,
    "videoFilename" TEXT,
    "videoThumbnail" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeContent_key_key" ON "ResumeContent"("key");
