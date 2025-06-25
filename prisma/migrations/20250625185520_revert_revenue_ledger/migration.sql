/*
  Warnings:

  - You are about to drop the column `amount` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `Revenue` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "amount",
DROP COLUMN "createdAt",
DROP COLUMN "planId",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
