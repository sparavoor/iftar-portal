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

        // Check if mobile already exists - REMOVED to allow multiple registrations
        // const existingUser = await prisma.registration.findFirst({
        //     where: { mobile },
        // })

        // if (existingUser) {
        //     return NextResponse.json(
        //         { error: 'Mobile number already registered', registration: existingUser },
        //         { status: 409 }
        //     )
        // }

        // Generate Registration ID
        const count = await prisma.registration.count()
        const sequence = (count + 1).toString().padStart(4, '0')
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
