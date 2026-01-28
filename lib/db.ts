import { PrismaClient, Prisma } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL as string
    
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)

    const defaultLogs: Prisma.LogLevel[] = ['query', 'info', 'warn', 'error']
    const logEnv = process.env.PRISMA_LOG
    const log: Prisma.LogLevel[] = logEnv
        ? logEnv.split(',').map((l) => l.trim() as Prisma.LogLevel)
        : defaultLogs

    return new PrismaClient({ adapter, log })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
