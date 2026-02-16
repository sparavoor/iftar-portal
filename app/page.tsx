import RegistrationForm from '@/components/RegistrationForm'
import { Moon } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-green-800 p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-white/20 p-3 rounded-full">
              <Moon className="h-8 w-8 text-yellow-400" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Iftar Participation</h1>
          <p className="text-green-100 text-sm">Registration Portal 2026</p>
        </div>

        <div className="p-6">
          <RegistrationForm />
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center border-t text-xs text-gray-500">
          © 2026 Iftar Committee. All rights reserved.
        </div>
      </div>
    </main>
  )
}
