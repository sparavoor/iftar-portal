import { prisma } from '@/lib/prisma'
import SuccessCard from '@/components/SuccessCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getRegistration(registrationId: string, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            // Try to fetch with cache bypass if using Accelerate
            // @ts-ignore: cacheStrategy is available via withAccelerate
            const registration = await prisma.registration.findUnique({
                where: { registrationId },
                cacheStrategy: { ttl: 0, swr: 0 },
            })
            if (registration) return registration
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error)
            // Fallback for local dev or if cacheStrategy fails
            if (i === retries - 1) {
                try {
                    const registration = await prisma.registration.findUnique({
                        where: { registrationId },
                    })
                    if (registration) return registration
                } catch (e) { console.error('Fallback failed', e) }
            }
        }
        if (i < retries - 1) await new Promise(res => setTimeout(res, delay))
    }
    return null
}

export default async function SuccessPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const registrationId = decodeURIComponent(params.id)

    const registration = await getRegistration(registrationId)

    if (!registration) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">Registration Not Found</h1>
                    <p className="text-gray-500">
                        We couldn't find registration ID: <span className="font-mono font-bold text-gray-700">{registrationId}</span>
                        <br />
                        Please check the ID or try registering again.
                    </p>
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
