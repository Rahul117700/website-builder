-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN     "videoLink" TEXT,
ADD COLUMN     "websiteLink" TEXT;

-- AlterTable
ALTER TABLE "MyTemplate" ADD COLUMN     "pages" JSONB;
