'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, X } from 'lucide-react'

export default function DateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const date = searchParams.get('date') || ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value
        if (newDate) {
            router.push(`/admin/dashboard?date=${newDate}`)
        } else {
            router.push('/admin/dashboard')
        }
    }

    const clearFilter = () => {
        router.push('/admin/dashboard')
    }

    return (
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
                type="date"
                value={date}
                onChange={handleChange}
                className="text-sm text-gray-700 outline-none w-32 md:w-auto"
            />
            {date && (
                <button onClick={clearFilter} className="text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
