import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "packages/database/prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});
