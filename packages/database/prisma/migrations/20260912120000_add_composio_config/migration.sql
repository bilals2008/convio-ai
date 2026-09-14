-- CreateTable
CREATE TABLE "composio_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "enabledToolkits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "composioSessionId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "composio_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "composio_configs_organizationId_key" ON "composio_configs"("organizationId");

-- CreateIndex
CREATE INDEX "composio_configs_organizationId_idx" ON "composio_configs"("organizationId");

-- AddForeignKey
ALTER TABLE "composio_configs" ADD CONSTRAINT "composio_configs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
