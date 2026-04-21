-- AlterTable
ALTER TABLE "GradingResult" ADD COLUMN     "ai_result" JSONB,
ADD COLUMN     "confidence_avg" DOUBLE PRECISION,
ADD COLUMN     "consistency" TEXT,
ADD COLUMN     "total_detected" INTEGER;
