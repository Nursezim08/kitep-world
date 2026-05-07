/*
  Warnings:

  - You are about to drop the column `manager_id` on the `branches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_manager_id_fkey";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "manager_id";
