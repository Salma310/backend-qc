/*
  Warnings:

  - You are about to drop the column `harvest_time` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `printed_at` on the `GradingResult` table. All the data in the column will be lost.
  - You are about to drop the column `qr_is_active` on the `GradingResult` table. All the data in the column will be lost.
  - You are about to drop the column `qr_token` on the `GradingResult` table. All the data in the column will be lost.
  - You are about to drop the column `qr_url` on the `GradingResult` table. All the data in the column will be lost.
  - The `status` column on the `GradingResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `QRAccessLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GradingStatus" AS ENUM ('PROCESSING', 'DONE', 'ERROR');

-- CreateEnum
CREATE TYPE "PrintStatus" AS ENUM ('NOT_PRINTED', 'PRINTED', 'REPRINTED');

-- DropForeignKey
ALTER TABLE "QRAccessLog" DROP CONSTRAINT "QRAccessLog_grading_id_fkey";

-- DropIndex
DROP INDEX "GradingResult_qr_token_key";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "harvest_time";

-- AlterTable
ALTER TABLE "GradingResult" DROP COLUMN "printed_at",
DROP COLUMN "qr_is_active",
DROP COLUMN "qr_token",
DROP COLUMN "qr_url",
ADD COLUMN     "bundle_id" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "GradingStatus" NOT NULL DEFAULT 'DONE';

-- DropTable
DROP TABLE "QRAccessLog";

-- CreateTable
CREATE TABLE "BatchGradeBundle" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "total_fruits" INTEGER NOT NULL DEFAULT 0,
    "total_weight" DOUBLE PRECISION,
    "fruit_type" TEXT,
    "harvest_date" TIMESTAMP(3),
    "farmer_name" TEXT,
    "origin_village" TEXT,
    "origin_city" TEXT,
    "sorted_at" TIMESTAMP(3),
    "qr_token" TEXT NOT NULL,
    "qr_url" TEXT,
    "qr_is_active" BOOLEAN NOT NULL DEFAULT true,
    "deactivated_at" TIMESTAMP(3),
    "deactivated_reason" TEXT,
    "print_status" "PrintStatus" NOT NULL DEFAULT 'NOT_PRINTED',
    "printed_at" TIMESTAMP(3),
    "printed_by_id" TEXT,
    "print_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchGradeBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleQRAccessLog" (
    "id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "device_type" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundleQRAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchGradeBundle_qr_token_key" ON "BatchGradeBundle"("qr_token");

-- CreateIndex
CREATE INDEX "BatchGradeBundle_qr_token_idx" ON "BatchGradeBundle"("qr_token");

-- CreateIndex
CREATE INDEX "BatchGradeBundle_batch_id_idx" ON "BatchGradeBundle"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "BatchGradeBundle_batch_id_grade_key" ON "BatchGradeBundle"("batch_id", "grade");

-- CreateIndex
CREATE INDEX "BundleQRAccessLog_bundle_id_idx" ON "BundleQRAccessLog"("bundle_id");

-- CreateIndex
CREATE INDEX "Batch_farmer_id_idx" ON "Batch"("farmer_id");

-- CreateIndex
CREATE INDEX "Batch_land_id_idx" ON "Batch"("land_id");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "GradingResult_batch_id_idx" ON "GradingResult"("batch_id");

-- CreateIndex
CREATE INDEX "GradingResult_bundle_id_idx" ON "GradingResult"("bundle_id");

-- CreateIndex
CREATE INDEX "GradingResult_grade_idx" ON "GradingResult"("grade");

-- AddForeignKey
ALTER TABLE "GradingResult" ADD CONSTRAINT "GradingResult_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "BatchGradeBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchGradeBundle" ADD CONSTRAINT "BatchGradeBundle_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchGradeBundle" ADD CONSTRAINT "BatchGradeBundle_printed_by_id_fkey" FOREIGN KEY ("printed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleQRAccessLog" ADD CONSTRAINT "BundleQRAccessLog_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "BatchGradeBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
