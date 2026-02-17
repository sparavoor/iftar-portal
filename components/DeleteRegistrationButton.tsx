'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteRegistrationButton({ registrationId }: { registrationId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        // Removed confirmation as requested
        setLoading(true)
        try {
            const res = await fetch(`/api/registrations/${registrationId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                toast.success('Registration deleted successfully')
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Failed to delete registration')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Delete Registration"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
    )
}
