import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { registrationId } = await request.json()

        if (!registrationId) {
            return NextResponse.json(
                { error: 'Registration ID is required' },
                { status: 400 }
            )
        }

        const registration = await prisma.registration.findUnique({
            where: { registrationId },
        })

        if (!registration) {
            return NextResponse.json(
                { error: 'Registration not found' },
                { status: 404 }
            )
        }

        if (registration.admitted) {
            return NextResponse.json(
                { error: 'Participant already admitted', registration },
                { status: 409 }
            )
        }

        const updatedRegistration = await prisma.registration.update({
            where: { registrationId },
            data: {
                admitted: true,
                admittedAt: new Date(),
            },
        })

        return NextResponse.json({ success: true, registration: updatedRegistration })
    } catch (error) {
        console.error('Admit Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
