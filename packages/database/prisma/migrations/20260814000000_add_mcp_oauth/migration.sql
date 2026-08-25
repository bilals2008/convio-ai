-- AlterTable: add OAuth + custom headers support to McpServer
ALTER TABLE "McpServer" ADD COLUMN "authType" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN "headers" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "oauthState" JSONB;
