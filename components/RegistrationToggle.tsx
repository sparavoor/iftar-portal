'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Lock, Unlock } from 'lucide-react'

export default function RegistrationToggle({ initialState }: { initialState: boolean }) {
    const [enabled, setEnabled] = useState(initialState)
    const [loading, setLoading] = useState(false)

    const toggle = async () => {
        setLoading(true)
        const newState = !enabled

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationOpen: newState }),
            })

            if (res.ok) {
                setEnabled(newState)
                toast.success(newState ? 'Registration Opened' : 'Registration Closed')
            } else {
                toast.error('Failed to update settings')
            }
        } catch {
            toast.error('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className={`p-3 rounded-full ${enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {enabled ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Registration Status</h3>
                <p className="text-sm text-gray-500">
                    {enabled ? 'Public registration is OPEN' : 'Public registration is CLOSED'}
                </p>
            </div>
            <button
                onClick={toggle}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
            >
                <span className="sr-only">Toggle registration</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
}
