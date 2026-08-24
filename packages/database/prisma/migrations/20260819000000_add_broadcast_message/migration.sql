-- AlterTable: add plain-text message for non-template channels (Telegram)
ALTER TABLE "broadcasts" ADD COLUMN "message" TEXT;
