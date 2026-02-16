import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, mobile, class: userClass, year } = body

        if (!name || !mobile) {
            return NextResponse.json(
                { error: 'Name and Mobile Number are required' },
                { status: 400 }
            )
        }

        // Check if mobile already exists
        const existingUser = await prisma.registration.findFirst({
            where: { mobile },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Mobile number already registered', registration: existingUser },
                { status: 409 }
            )
        }

        // Generate Registration ID
        const count = await prisma.registration.count()
        const sequence = (count + 1).toString().padStart(4, '0')
        const registrationId = `IFTAR-${year || '2026'}-${sequence}`

        // Create Registration
        const registration = await prisma.registration.create({
            data: {
                name,
                mobile,
                class: userClass,
                year,
                registrationId,
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
