import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET() {
    const session = await getServerSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const registrations = await prisma.registration.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ registrations })
    } catch (error) {
        console.error('Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
