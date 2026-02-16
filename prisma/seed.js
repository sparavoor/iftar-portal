require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

console.log('DATABASE_URL:', process.env.DATABASE_URL)

const prisma = new PrismaClient()

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
    console.log('Admin user created:', admin)
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
