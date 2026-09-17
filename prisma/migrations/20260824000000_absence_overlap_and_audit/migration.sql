-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'LOGIN_SUCCEEDED';
ALTER TYPE "AuditAction" ADD VALUE 'LOGIN_FAILED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "monthly_salary_minor" BIGINT;

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_user_id_fkey";

-- DropForeignKey
ALTER TABLE "absence_requests" DROP CONSTRAINT "absence_requests_user_id_fkey";

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_requests" ADD CONSTRAINT "absence_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- AlterTable
ALTER TABLE "absence_requests"
  ADD CONSTRAINT absence_requests_user_active_range_excl
  EXCLUDE USING gist (
    "user_id" WITH =,
    daterange("startDate", "endDate", '[]') WITH &&
  ) WHERE (status IN ('PENDING', 'APPROVED'));

-- Policy comments for raw-whitelisted constraints
COMMENT ON CONSTRAINT absence_requests_user_active_range_excl
  ON "absence_requests" IS 'raw-whitelisted';

COMMENT ON CONSTRAINT absence_requests_date_range_check
  ON "absence_requests" IS 'raw-whitelisted';
