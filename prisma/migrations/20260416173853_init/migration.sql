-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'QC', 'MANAGER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A', 'B', 'C', 'REJECT');

-- CreateEnum
CREATE TYPE "GradingMethod" AS ENUM ('AI', 'MANUAL');

-- CreateEnum
CREATE TYPE "NotifChannel" AS ENUM ('TELEGRAM', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotifStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'QC',
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "farmer_code" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "village" TEXT,
    "district" TEXT,
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Land" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "land_code" TEXT NOT NULL,
    "land_name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location" TEXT,
    "area_size" DOUBLE PRECISION,
    "fruit_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Land_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "lot_code" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "land_id" TEXT NOT NULL,
    "fruit_type" TEXT,
    "harvest_date" TIMESTAMP(3),
    "harvest_time" TIMESTAMP(3),
    "harvest_weight" DOUBLE PRECISION,
    "treatment" TEXT,
    "notes" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'OPEN',
    "total_fruits" INTEGER NOT NULL DEFAULT 0,
    "total_grade_a" INTEGER NOT NULL DEFAULT 0,
    "total_grade_b" INTEGER NOT NULL DEFAULT 0,
    "total_grade_c" INTEGER NOT NULL DEFAULT 0,
    "total_reject" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradingResult" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "grading_code" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "grading_method" "GradingMethod" NOT NULL DEFAULT 'AI',
    "confidence" DOUBLE PRECISION,
    "defect_detected" BOOLEAN,
    "expiry_prediction" INTEGER,
    "color_score" DOUBLE PRECISION,
    "texture_score" DOUBLE PRECISION,
    "defect_score" DOUBLE PRECISION,
    "size_score" DOUBLE PRECISION,
    "weight_estimate" DOUBLE PRECISION,
    "ml_model_used" TEXT,
    "ml_model_version" TEXT,
    "image_urls" TEXT[],
    "qr_token" TEXT NOT NULL,
    "qr_url" TEXT,
    "printed_at" TIMESTAMP(3),
    "qr_is_active" BOOLEAN NOT NULL DEFAULT true,
    "graded_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRAccessLog" (
    "id" TEXT NOT NULL,
    "grading_id" TEXT NOT NULL,
    "device_type" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "location" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "grading_id" TEXT,
    "user_id" TEXT,
    "channel" "NotifChannel" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotifStatus" NOT NULL DEFAULT 'PENDING',
    "error_msg" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_farmer_code_key" ON "Farmer"("farmer_code");

-- CreateIndex
CREATE UNIQUE INDEX "Land_land_code_key" ON "Land"("land_code");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_lot_code_key" ON "Batch"("lot_code");

-- CreateIndex
CREATE UNIQUE INDEX "GradingResult_grading_code_key" ON "GradingResult"("grading_code");

-- CreateIndex
CREATE UNIQUE INDEX "GradingResult_qr_token_key" ON "GradingResult"("qr_token");

-- AddForeignKey
ALTER TABLE "Land" ADD CONSTRAINT "Land_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_land_id_fkey" FOREIGN KEY ("land_id") REFERENCES "Land"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingResult" ADD CONSTRAINT "GradingResult_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingResult" ADD CONSTRAINT "GradingResult_graded_by_id_fkey" FOREIGN KEY ("graded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRAccessLog" ADD CONSTRAINT "QRAccessLog_grading_id_fkey" FOREIGN KEY ("grading_id") REFERENCES "GradingResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_grading_id_fkey" FOREIGN KEY ("grading_id") REFERENCES "GradingResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
