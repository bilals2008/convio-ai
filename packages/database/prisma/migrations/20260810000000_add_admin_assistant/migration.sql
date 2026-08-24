-- CreateTable
CREATE TABLE "admin_conversations" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New conversation',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "admin_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "usage" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_assistant_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "query" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "latencyMs" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_assistant_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_conversations_adminId_updatedAt_idx" ON "admin_conversations"("adminId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "admin_messages_conversationId_createdAt_idx" ON "admin_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_assistant_logs_actorId_createdAt_idx" ON "admin_assistant_logs"("actorId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "admin_conversations" ADD CONSTRAINT "admin_conversations_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_messages" ADD CONSTRAINT "admin_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "admin_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
