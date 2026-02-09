/*
  Warnings:

  - You are about to drop the column `userId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `asaasCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `asaasSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `enableNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privacyMode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[asaasCustomerId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Made the column `groupId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ATIVO', 'CANCELADO', 'PENDENTE');

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropIndex
DROP INDEX "Goal_userId_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- DropIndex
DROP INDEX "User_asaasCustomerId_key";

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "userId",
ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "ownerId",
ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "asaasSubscriptionId" TEXT,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "userId",
ADD COLUMN     "createdById" INTEGER,
ALTER COLUMN "groupId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "asaasCustomerId",
DROP COLUMN "asaasSubscriptionId",
DROP COLUMN "enableNotifications",
DROP COLUMN "plan",
DROP COLUMN "privacyMode",
DROP COLUMN "subscriptionStatus";

-- DropEnum
DROP TYPE "subscriptionStatus";

-- CreateIndex
CREATE INDEX "Goal_groupId_idx" ON "Goal"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_asaasCustomerId_key" ON "Group"("asaasCustomerId");

-- CreateIndex
CREATE INDEX "Transaction_groupId_idx" ON "Transaction"("groupId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
