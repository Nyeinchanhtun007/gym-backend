/*
  Warnings:

  - You are about to drop the column `classLimit` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Membership` table. All the data in the column will be lost.
  - Added the required column `billingCycle` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planTier` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "classLimit",
DROP COLUMN "type",
ADD COLUMN     "billingCycle" TEXT NOT NULL,
ADD COLUMN     "dailyClassLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyClassLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextBillingCycle" TEXT,
ADD COLUMN     "nextPlanTier" TEXT,
ADD COLUMN     "planTier" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photo" TEXT;

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyClassLimit" INTEGER NOT NULL,
    "monthlyClassLimit" INTEGER NOT NULL,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_name_key" ON "MembershipPlan"("name");
