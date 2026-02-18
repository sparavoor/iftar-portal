
import { prisma } from './lib/prisma.ts'

async function main() {
    const latest = await prisma.registration.findFirst({
        orderBy: { createdAt: 'desc' }
    })
    console.log('Latest Registration:', latest)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
