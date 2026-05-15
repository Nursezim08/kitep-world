/*
  Warnings:

  - You are about to drop the column `image` on the `banners` table. All the data in the column will be lost.
  - Added the required column `desktop_image` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile_image` to the `banners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "image",
ADD COLUMN     "desktop_image" TEXT NOT NULL,
ADD COLUMN     "mobile_image" TEXT NOT NULL;
