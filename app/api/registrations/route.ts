import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    try {
        let whereClause = {}

        if (dateParam) {
            const startOfDay = new Date(dateParam)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(dateParam)
            endOfDay.setHours(23, 59, 59, 999)

            whereClause = {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            }
        }

        const registrations = await prisma.registration.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ registrations })
    } catch (error) {
        console.error('Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
