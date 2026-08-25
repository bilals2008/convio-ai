-- CreateTable
CREATE TABLE "McpServer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'stdio',
    "command" TEXT,
    "args" JSONB NOT NULL DEFAULT '[]',
    "url" TEXT,
    "apiKey" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "McpServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMcpServer" (
    "agentId" TEXT NOT NULL,
    "mcpServerId" TEXT NOT NULL,

    CONSTRAINT "AgentMcpServer_pkey" PRIMARY KEY ("agentId", "mcpServerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "McpServer_organizationId_name_key" ON "McpServer"("organizationId", "name");

-- CreateIndex
CREATE INDEX "McpServer_organizationId_idx" ON "McpServer"("organizationId");

-- CreateIndex
CREATE INDEX "AgentMcpServer_mcpServerId_idx" ON "AgentMcpServer"("mcpServerId");

-- AddForeignKey
ALTER TABLE "McpServer" ADD CONSTRAINT "McpServer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMcpServer" ADD CONSTRAINT "AgentMcpServer_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMcpServer" ADD CONSTRAINT "AgentMcpServer_mcpServerId_fkey" FOREIGN KEY ("mcpServerId") REFERENCES "McpServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
