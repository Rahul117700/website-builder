/*
  Warnings:

  - You are about to drop the column `total` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Revenue` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "total",
DROP COLUMN "updatedAt",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "planId" TEXT NOT NULL;
