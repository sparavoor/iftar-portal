'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ScanPage() {
    const router = useRouter()
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
    const [scanning, setScanning] = useState(true)

    useEffect(() => {
        // Check if session exists (client side simplistic check)
        // In real app, middleware handles this.

        const onScanSuccess = async (decodedText: string, decodedResult: any) => {
            // Stop scanning temporarily

            try {
                // Parse JSON if possible
                let registrationId = decodedText
                try {
                    const json = JSON.parse(decodedText)
                    if (json.id) registrationId = json.id
                } catch (e) {
                    // Not JSON, assume string ID
                }

                // Call API
                const res = await fetch('/api/admit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ registrationId }),
                })

                const result = await res.json()

                if (res.ok) {
                    setScanResult({ success: true, message: 'Admitted Successfully', data: result.registration })
                    toast.success('Admitted Successfully')
                } else {
                    if (res.status === 409) {
                        setScanResult({ success: false, message: 'Already Admitted', data: result.registration })
                        toast.warning('Already Admitted')
                    } else {
                        setScanResult({ success: false, message: result.error || 'Invalid QR Code' })
                        toast.error(result.error || 'Scan Failed')
                    }
                }

                // Clear scanner to stop calls
                const scannerElement = document.getElementById('reader')
                if (scannerElement) {
                    // If we want to stop: scanner.clear()
                }
                setScanning(false)

            } catch (err) {
                console.error(err)
                toast.error('Processing Error')
            }
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                videoConstraints: {
                    facingMode: "environment"
                }
            },
        /* verbose= */ false
        );

        if (scanning) {
            scanner.render(onScanSuccess, (err) => {
                // ignore errors
            });
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err))
        }
    }, [scanning])

    const handleNext = () => {
        setScanResult(null)
        setScanning(true)
        // Reload page to reset scanner? Or just re-mount component? 
        // Scanner lib is tricky with re-mounting. Hard reload is safest for camera release.
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="p-4 flex items-center bg-gray-800 border-b border-gray-700">
                <Link href="/admin/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-lg font-bold">QR Admit Scanner</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                {!scanResult ? (
                    <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-lg">
                        <div id="reader" className="w-full bg-white text-black"></div>
                        <div className="p-4 bg-gray-100 text-center text-gray-500 text-sm">
                            Point camera at participant QR code
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 text-center space-y-6 animate-in fade-in zoom-in">
                        {scanResult.success ? (
                            <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                        ) : (
                            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                                <XCircle className="h-16 w-16 text-red-500" />
                            </div>
                        )}

                        <div>
                            <h2 className={`text-2xl font-bold ${scanResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                {scanResult.message}
                            </h2>
                            {scanResult.data && (
                                <div className="mt-4 p-4 bg-gray-700 rounded-lg text-left space-y-2">
                                    <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{scanResult.data.name}</span></p>
                                    <p><span className="text-gray-400">ID:</span> <span className="font-mono">{scanResult.data.registrationId}</span></p>
                                    <p><span className="text-gray-400">Mobile:</span> {scanResult.data.mobile}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Scan Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
