-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productEmails" BOOLEAN NOT NULL DEFAULT true;
