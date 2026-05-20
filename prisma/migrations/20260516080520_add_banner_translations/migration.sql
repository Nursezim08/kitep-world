/*
  Warnings:

  - You are about to drop the column `title` on the `banners` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "title";

-- CreateTable
CREATE TABLE "banner_translations" (
    "id" UUID NOT NULL,
    "banner_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "banner_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banner_translations_banner_id_locale_key" ON "banner_translations"("banner_id", "locale");

-- AddForeignKey
ALTER TABLE "banner_translations" ADD CONSTRAINT "banner_translations_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
