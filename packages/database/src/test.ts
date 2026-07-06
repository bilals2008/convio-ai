import { prisma } from '@convio/database'

async function test() {
  const userCount = await prisma.user.count()
  const orgCount = await prisma.organization.count()
  const agentCount = await prisma.agent.count()
  console.log({ userCount, orgCount, agentCount })

  const connected = await prisma.$queryRaw`SELECT 1 AS connected`
  console.log('Database connection:', connected)
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
