import { prisma } from '@/lib/prisma'
import RegistrationForm from '@/components/RegistrationForm'
import Link from 'next/link'
import { Moon, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let settings = { registrationOpen: true } // Default
  try {
    const dbSettings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (dbSettings) settings = dbSettings
  } catch (error) {
    console.error("Failed to fetch settings:", error)
  }

  const isOpen = settings.registrationOpen

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-green-800 p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-white/20 p-3 rounded-full">
              <Moon className="h-8 w-8 text-yellow-400" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">DAILY IFTHAR REGISTRATION</h1>
          <p className="text-green-100 text-sm">SSF FAROOK COLLEGE</p>
        </div>

        <div className="p-6">
          {isOpen ? (
            <RegistrationForm />
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Registration Closed</h2>
              <p className="text-gray-500">
                Participation registration is currently closed.
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold animate-pulse">
                  Opening Soon
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center border-t text-xs text-gray-500">
          © SSF FAROOK COLLEGE . All rights reserved.
        </div>
      </div>
    </main>
  )
}
