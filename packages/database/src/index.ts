import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Prisma } from "./generated/client.js"
import {
  MembershipRole,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
} from "./generated/enums.js"

export type { Prisma as PrismaTypes } from "./generated/client.js"
export type { McpServer, AgentMcpServer } from "./generated/client.js"
export { Prisma, PrismaClient }
export {
  MembershipRole,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.PG_POOL_MAX ?? 10),
    // ponytail: remote Supabase handshakes can be slow — don't close idle conns
    // (pg default: never) or every idle gap pays a fresh connect; 30s cap only
    // on connect attempts so a dead DB fails fast instead of hanging.
    connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS ?? 30_000),
  })

  const adapter = new PrismaPg(pool)

  globalForPrisma.pool = pool
  return new PrismaClient({ adapter })
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient]
  },
})

export default prisma
