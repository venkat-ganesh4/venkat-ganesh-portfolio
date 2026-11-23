-- CreateTable
CREATE TABLE "VisitorThought" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorThought_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorThought_published_createdAt_idx" ON "VisitorThought"("published", "createdAt");
