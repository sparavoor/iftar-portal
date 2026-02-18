
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const registration = await prisma.registration.findUnique({
            where: { registrationId: id },
        })

        if (!registration) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
        }

        return NextResponse.json({ registration })
    } catch (error) {
        console.error('Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params // This is registrationId, NOT primary key id

    try {
        await prisma.registration.delete({
            where: { registrationId: id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete Error:", error)
        return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
    }
}
