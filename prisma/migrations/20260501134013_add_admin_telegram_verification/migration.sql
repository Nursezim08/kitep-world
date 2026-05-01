-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegram_id" VARCHAR(255);

-- CreateTable
CREATE TABLE "admin_verifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_verifications_user_id_code_idx" ON "admin_verifications"("user_id", "code");

-- AddForeignKey
ALTER TABLE "admin_verifications" ADD CONSTRAINT "admin_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
