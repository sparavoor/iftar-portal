
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
    const password = await bcrypt.hash('admin123', 10)

    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password,
        },
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
