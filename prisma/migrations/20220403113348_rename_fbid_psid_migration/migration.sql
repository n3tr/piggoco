/*
  Warnings:

  - You are about to drop the column `fbId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fbPsId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_fbId_key";

-- AlterTable
ALTER TABLE "User"
RENAME COLUMN "fbId" TO "fbPsId";

-- CreateIndex
CREATE UNIQUE INDEX "User_fbPsId_key" ON "User"("fbPsId");
