import { prisma } from '@/lib/prisma'
import SuccessCard from '@/components/SuccessCard'
import Link from 'next/link'

export default async function SuccessPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const registrationId = params.id

    // Use registrationId field not id primary key
    let registration = null
    try {
        registration = await prisma.registration.findUnique({
            where: { registrationId },
        })
    } catch (error) {
        console.error('Failed to fetch registration:', error)
        // Ensure we don't crash, let the null check handle usage
    }

    if (!registration) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">Registration Not Found</h1>
                    <p className="text-gray-500">The registration ID provided does not exist.</p>
                    <Link href="/" className="text-green-600 hover:underline">Go back home</Link>
                </div>
            </main>
        )
    }

    // Serializable object for client component
    const serializedRegistration = {
        ...registration,
        createdAt: registration.createdAt.toISOString(),
        admittedAt: registration.admittedAt ? registration.admittedAt.toISOString() : null,
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
            <SuccessCard registration={serializedRegistration as any} />
        </main>
    )
}
