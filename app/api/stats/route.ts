import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const totalRegistrations = await prisma.registration.count()
        const totalAdmitted = await prisma.registration.count({
            where: { admitted: true },
        })
        const pendingAdmissions = totalRegistrations - totalAdmitted

        return NextResponse.json({
            totalRegistrations,
            totalAdmitted,
            pendingAdmissions,
        }, { status: 200 })
    } catch (error) {
        console.error('Stats Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
