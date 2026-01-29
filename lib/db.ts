import { PrismaClient, Prisma } from '@prisma/client'

const prismaClientSingleton = () => {
    const defaultLogs: Prisma.LogLevel[] = ['query', 'info', 'warn', 'error']
    const logEnv = process.env.PRISMA_LOG
    const log: Prisma.LogLevel[] = logEnv
        ? logEnv.split(',').map((l) => l.trim() as Prisma.LogLevel)
        : defaultLogs

    return new PrismaClient({ log })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
