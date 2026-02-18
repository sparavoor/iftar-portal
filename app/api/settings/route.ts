
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// GET: Publicly accessible to check status
export async function GET() {
    try {
        let settings = await prisma.systemSettings.findUnique({
            where: { id: 'default' }
        })

        if (!settings) {
            // Create default if not exists
            settings = await prisma.systemSettings.create({
                data: { id: 'default', registrationOpen: true }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Settings GET Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST: Admin only to update status
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { registrationOpen } = await request.json()

        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: { registrationOpen },
            create: { id: 'default', registrationOpen },
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Settings POST Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
