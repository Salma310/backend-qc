-- AlterTable
ALTER TABLE "GradingResult" ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DONE';
