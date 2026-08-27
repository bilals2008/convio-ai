-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN "deletedAt" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "support_tickets_deletedAt_idx" ON "support_tickets"("deletedAt");
