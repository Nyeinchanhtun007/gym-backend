-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "autoDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "autoDiscountCode" TEXT,
ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PaymentRequest" ADD COLUMN     "autoDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "autoDiscountCode" TEXT,
ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
