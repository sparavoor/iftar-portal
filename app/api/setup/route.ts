import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        const password = await bcrypt.hash('admin123', 10)
        const admin = await prisma.admin.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password,
            },
        })
        return NextResponse.json({ success: true, message: "Admin user created: admin / admin123", admin })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
