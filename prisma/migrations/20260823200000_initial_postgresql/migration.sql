-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'JEFE', 'PROFESIONAL', 'RESIDENTE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('SICK_LEAVE', 'VACATION', 'PERSONAL', 'CONGRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ABSENCE_CREATED', 'ABSENCE_APPROVED', 'ABSENCE_REJECTED', 'ATTENDANCE_CHECKED_IN', 'ATTENDANCE_CHECKED_OUT');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "provider_account_id" VARCHAR(100) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" VARCHAR(191) NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" VARCHAR(320) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" VARCHAR(320),
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'RESIDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeIn" TIMESTAMP(3) NOT NULL,
    "timeOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absence_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewDttm" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "absence_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "absence_requests_date_range_check" CHECK ("endDate" >= "startDate")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "attendances_user_id_date_key" ON "attendances"("user_id", "date");
CREATE INDEX "absence_requests_user_id_createdAt_idx" ON "absence_requests"("user_id", "createdAt");
CREATE INDEX "absence_requests_status_startDate_idx" ON "absence_requests"("status", "startDate");
CREATE INDEX "absence_requests_reviewed_by_idx" ON "absence_requests"("reviewed_by");
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "absence_requests" ADD CONSTRAINT "absence_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "absence_requests" ADD CONSTRAINT "absence_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
