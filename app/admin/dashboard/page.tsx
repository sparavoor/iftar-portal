import { prisma } from '@/lib/prisma'
import { Users, UserCheck, Clock, QrCode, LogOut } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import DashboardActions from '@/components/DashboardActions'
import DateFilter from '@/components/DateFilter'
import RegistrationToggle from '@/components/RegistrationToggle'

async function getStats(date?: string) {
    let whereClause = {}

    if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        whereClause = {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        }
    }

    const total = await prisma.registration.count({ where: whereClause })
    const admitted = await prisma.registration.count({ where: { ...whereClause, admitted: true } })
    const pending = total - admitted

    // If filtering by date, we show ALL for that date. If global, show last 10.
    const take = date ? undefined : 10

    const recent = await prisma.registration.findMany({
        where: whereClause,
        take: take,
        orderBy: { createdAt: 'desc' },
    })

    // Fetch Settings
    let settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings) settings = { id: 'default', registrationOpen: true }

    return { total, admitted, pending, recent, settings }
}

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { date } = (await searchParams) as { date?: string }
    const session = await getServerSession()
    if (!session) redirect('/admin/login')

    const stats = await getStats(date)

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <Link href="/admin/scan" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <QrCode className="h-4 w-4" />
                        <span>Scan QR</span>
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="text-gray-500 hover:text-red-600 p-2">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto space-y-6">

                {/* Filters */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-600 font-medium">Overview {date ? `for ${new Date(date).toLocaleDateString()}` : 'All Time'}</h2>
                    </div>
                    <DateFilter />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Settings Card */}
                    <div className="md:col-span-3">
                        <RegistrationToggle initialState={stats.settings.registrationOpen} />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Registrations</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-green-50 rounded-full text-green-600">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Admitted</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.admitted}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">
                            {date ? `Registrations (${stats.recent.length})` : 'Recent Registrations'}
                        </h2>
                        <DashboardActions date={date} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Mobile</th>
                                    <th className="px-6 py-3">Class</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.recent.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-mono text-gray-600">{reg.registrationId}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{reg.name}</td>
                                        <td className="px-6 py-3 text-gray-600">{reg.mobile}</td>
                                        <td className="px-6 py-3 text-gray-600">{reg.class || '-'}</td>
                                        <td className="px-6 py-3">
                                            {reg.admitted ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Admitted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{new Date(reg.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {stats.recent.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No registrations found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
