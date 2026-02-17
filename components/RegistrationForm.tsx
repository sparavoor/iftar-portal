'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Phone, User, Building, Calendar, CheckCircle, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function RegistrationForm() {
    const router = useRouter()
    const [step, setStep] = useState<'mobile' | 'details' | 'existing'>('mobile')
    const [loading, setLoading] = useState(false)

    // Form Data
    const [mobile, setMobile] = useState('')
    const [name, setName] = useState('')
    const [department, setDepartment] = useState('')
    const [year, setYear] = useState('')

    // Existing User Data
    const [existingUser, setExistingUser] = useState<any>(null)

    const handleMobileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mobile || mobile.length < 10) {
            toast.error('Please enter a valid mobile number')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/check-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile }),
            })
            const data = await res.json()

            if (data.exists) {
                setExistingUser(data.registration)
                setStep('existing')
                toast.success('You are already registered!')
            } else {
                setStep('details')
            }
        } catch (error) {
            toast.error('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, mobile, department, year }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Registration Successful!')
                router.push(`/success/${data.registration.registrationId}`)
            } else {
                toast.error(data.error || 'Registration failed')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const downloadTicket = () => {
        if (existingUser) {
            router.push(`/success/${existingUser.registrationId}`)
        }
    }

    if (step === 'mobile') {
        return (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="tel"
                            required
                            placeholder="Enter your mobile number"
                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black outline-none"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
                </button>
            </form>
        )
    }

    if (step === 'existing') {
        return (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Welcome Back, {existingUser.name}!</h3>
                    <p className="text-gray-500 text-sm mt-1">You have already registered.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2 text-sm border border-gray-200">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Mobile</span>
                        <span className="font-medium">{existingUser.mobile}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 pt-2">
                        <span className="text-gray-500">Department</span>
                        <span className="font-medium">{existingUser.department}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-gray-500">Year</span>
                        <span className="font-medium">{existingUser.year}</span>
                    </div>
                </div>

                <div className="grid gap-3">
                    <button
                        onClick={downloadTicket}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download className="h-5 w-5" /> Download Last Ticket
                    </button>
                    <button
                        onClick={() => {
                            setName(existingUser.name)
                            setDepartment(existingUser.department || '')
                            setYear(existingUser.year || '')
                            setStep('details')
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                    >
                        Register Again
                    </button>
                    <button
                        onClick={() => setStep('mobile')}
                        className="text-sm text-gray-500 hover:text-gray-700 underline pt-2"
                    >
                        Use a different number
                    </button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                    <p className="text-xs text-blue-600 font-semibold">Mobile Verified</p>
                    <p className="text-sm text-blue-800 font-bold">{mobile}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="ml-auto text-xs text-blue-500 underline"
                >
                    Change
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative">
                    <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                        required
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black outline-none bg-white appearance-none"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        <option value="">Select Department</option>
                        <option value="Arabic & Islamic History">Arabic & Islamic History</option>
                        <option value="English (Aided)">English (Aided)</option>
                        <option value="English (SF)">English (SF)</option>
                        <option value="Functional English (SF)">Functional English (SF)</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Sociology">Sociology</option>
                        <option value="Multimedia">Multimedia</option>
                        <option value="Economics">Economics</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Statistics">Statistics</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Psychology (Aided)">Psychology (Aided)</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Botany">Botany</option>
                        <option value="Zoology">Zoology</option>
                        <option value="Commerce (Aided)">Commerce (Aided)</option>
                        <option value="BBA">BBA</option>
                        <option value="Integrated Geology">Integrated Geology</option>
                        <option value="History">History</option>
                        <option value="Library & Information Science">Library & Information Science</option>
                        <option value="Automobile (SF)">Automobile (SF)</option>
                        <option value="Software Development (SF)">Software Development (SF)</option>
                        <option value="Commerce (Computer Application – SF)">Commerce (Computer Application – SF)</option>
                        <option value="Psychology (SF)">Psychology (SF)</option>
                        <option value="Journalism & Mass Communication (SF)">Journalism & Mass Communication (SF)</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                        required
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black outline-none bg-white"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register Now'}
            </button>
        </form>
    )
}
