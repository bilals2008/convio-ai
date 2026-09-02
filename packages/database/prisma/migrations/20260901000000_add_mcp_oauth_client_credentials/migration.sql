-- AlterTable: add pre-registered OAuth client credentials to McpServer
ALTER TABLE "McpServer" ADD COLUMN "clientId" TEXT,
ADD COLUMN "clientSecret" TEXT;
