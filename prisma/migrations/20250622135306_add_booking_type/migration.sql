-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('meet', 'call', 'table');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "callNumber" TEXT,
ADD COLUMN     "meetLink" TEXT,
ADD COLUMN     "tableNumber" TEXT,
ADD COLUMN     "type" "BookingType" NOT NULL DEFAULT 'table';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
