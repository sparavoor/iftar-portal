'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Phone, BookOpen, Calendar, Loader2 } from 'lucide-react'

export default function RegistrationForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            mobile: formData.get('mobile'),
            class: formData.get('class'),
            year: formData.get('year'),
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Something went wrong')
            }

            toast.success('Registration Successful!')
            router.push(`/success/${result.registration.registrationId}`)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground text-gray-400" />
                    <input
                        id="name"
                        name="name"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 border-gray-300 focus:border-green-600 focus:ring-green-600"
                        placeholder="Enter your full name"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium leading-none">Mobile Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 border-gray-300 focus:border-green-600 focus:ring-green-600"
                        placeholder="Enter 10-digit mobile number"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="class" className="text-sm font-medium leading-none">Class</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <select
                            id="class"
                            name="class"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 border-gray-300 focus:border-green-600 focus:ring-green-600 appearance-none"
                        >
                            <option value="">Select Class</option>
                            <option value="1">Class 1</option>
                            <option value="2">Class 2</option>
                            <option value="3">Class 3</option>
                            <option value="4">Class 4</option>
                            <option value="5">Class 5</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="year" className="text-sm font-medium leading-none">Year</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <select
                            id="year"
                            name="year"
                            required
                            defaultValue="2026"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 border-gray-300 focus:border-green-600 focus:ring-green-600 appearance-none"
                        >
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-800 text-white hover:bg-green-900 h-10 px-4 py-2 w-full"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                    </>
                ) : (
                    'Register Now'
                )}
            </button>
        </form>
    )
}
