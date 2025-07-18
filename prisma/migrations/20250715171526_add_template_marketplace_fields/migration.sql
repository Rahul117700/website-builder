/*
  Warnings:

  - You are about to drop the column `code` on the `Template` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "code",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "css" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "html" TEXT,
ADD COLUMN     "js" TEXT,
ADD COLUMN     "preview" TEXT;
