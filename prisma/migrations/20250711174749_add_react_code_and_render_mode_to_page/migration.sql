-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "reactCode" TEXT,
ADD COLUMN     "renderMode" TEXT NOT NULL DEFAULT 'html';
