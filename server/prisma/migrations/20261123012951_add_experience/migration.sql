-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "description" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "Experience_published_sortOrder_idx" ON "Experience"("published", "sortOrder");
