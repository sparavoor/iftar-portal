
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { mobile } = await request.json()

        if (!mobile) {
            return NextResponse.json({ error: 'Mobile number required' }, { status: 400 })
        }

        const existing = await prisma.registration.findFirst({
            where: { mobile },
            orderBy: { createdAt: 'asc' }, // Ensure we get the initial registration
        })

        if (existing) {
            return NextResponse.json({ exists: true, registration: existing })
        } else {
            return NextResponse.json({ exists: false })
        }
    } catch (error) {
        console.error('Check Registration Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
