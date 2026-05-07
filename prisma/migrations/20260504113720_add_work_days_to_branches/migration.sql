-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "work_days" TEXT[] DEFAULT ARRAY[]::TEXT[];
