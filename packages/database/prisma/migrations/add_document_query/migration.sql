-- CreateTable
CREATE TABLE "DocumentQuery" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentQuery_documentId_createdAt_idx" ON "DocumentQuery"("documentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DocumentQuery_documentId_success_idx" ON "DocumentQuery"("documentId", "success");

-- CreateIndex
CREATE INDEX "DocumentQuery_messageId_idx" ON "DocumentQuery"("messageId");

-- AddForeignKey
ALTER TABLE "DocumentQuery" ADD CONSTRAINT "DocumentQuery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentQuery" ADD CONSTRAINT "DocumentQuery_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
