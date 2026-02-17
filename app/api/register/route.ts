import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, mobile, department, year } = body

        // Basic validation
        if (!name || !mobile || !department || !year) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check for existing registration TODAY
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const existingToday = await prisma.registration.findFirst({
            where: {
                mobile,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })

        if (existingToday) {
            return NextResponse.json(
                { error: 'You have already registered today. Please try again tomorrow.' },
                { status: 409 }
            )
        }

        // Generate Registration ID (Find latest to avoid duplicates)
        const lastRegistration = await prisma.registration.findFirst({
            orderBy: { createdAt: 'desc' },
        })

        let sequenceNumber = 1
        if (lastRegistration && lastRegistration.registrationId) {
            const parts = lastRegistration.registrationId.split('-')
            if (parts.length === 3) {
                const lastSeq = parseInt(parts[2])
                if (!isNaN(lastSeq)) {
                    sequenceNumber = lastSeq + 1
                }
            }
        }

        const sequence = sequenceNumber.toString().padStart(4, '0')
        const registrationId = `IFTAR-${year || '2026'}-${sequence}`

        // Create Registration
        const registration = await prisma.registration.create({
            data: {
                registrationId,
                name,
                mobile,
                department, // Renamed from class
                year,
            },
        })

        return NextResponse.json({ success: true, registration }, { status: 201 })
    } catch (error) {
        console.error('Registration Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
