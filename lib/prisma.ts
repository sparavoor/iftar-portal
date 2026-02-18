import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL

    if (url?.startsWith('prisma://')) {
        console.log('Initializing Prisma Client with Accelerate')
        return new PrismaClient().$extends(withAccelerate())
    }

    console.log('Initializing Prisma Client (Standard/Local)')
    return new PrismaClient().$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query }) {
                    // Strip cacheStrategy if present to avoid "Unknown argument" error in standard client
                    const typedArgs = args as { cacheStrategy?: unknown }
                    if (typedArgs && typedArgs.cacheStrategy) {
                        delete typedArgs.cacheStrategy
                    }
                    return query(args)
                }
            }
        }
    })
}

type PrismaClientWithAccelerate = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientWithAccelerate | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
