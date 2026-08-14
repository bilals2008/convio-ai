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
