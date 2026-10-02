-- Migrate deprecated 'sse' servers to 'streamable-http'.
-- SSE transport was superseded by Streamable HTTP in MCP spec 2025-03-26.
UPDATE "McpServer" SET "type" = 'streamable-http' WHERE "type" = 'sse';

-- AlterTable: default transport is now streamable-http.
ALTER TABLE "McpServer" ALTER COLUMN "type" SET DEFAULT 'streamable-http';

-- Drop stdio-only columns. stdio was never supported (it executes arbitrary
-- OS commands on the API host — RCE) and has been removed from the feature.
ALTER TABLE "McpServer" DROP COLUMN "command";
ALTER TABLE "McpServer" DROP COLUMN "args";
