-- CreateTable
CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "pageTitle" TEXT NOT NULL DEFAULT 'About Me',
    "headline" TEXT NOT NULL DEFAULT '',
    "intro" TEXT NOT NULL DEFAULT '',
    "whoIAm" TEXT NOT NULL DEFAULT '',
    "whatIExplore" TEXT NOT NULL DEFAULT '',
    "beyondTech" TEXT NOT NULL DEFAULT '',
    "myDirection" TEXT NOT NULL DEFAULT '',
    "profileImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AboutContent_key_key" ON "AboutContent"("key");
