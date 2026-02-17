'use client'

import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Dynamically import to avoid SSR issues with html5-qrcode
import { Html5Qrcode } from 'html5-qrcode'

export default function ScanPage() {
    const router = useRouter()
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
    const [scanning, setScanning] = useState(false)
    const [manualId, setManualId] = useState('')
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Cleanup error", err))
            }
        }
    }, [])

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualId.trim()) return
        await processRegistrationId(manualId.trim())
    }

    const processRegistrationId = async (id: string) => {
        try {
            const res = await fetch('/api/admit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: id }),
            })

            const result = await res.json()

            if (res.ok) {
                setScanResult({ success: true, message: 'Admitted Successfully', data: result.registration })
                toast.success('Admitted Successfully')
                setManualId('')
                stopScanning()
            } else {
                if (res.status === 409) {
                    setScanResult({ success: false, message: 'Already Admitted', data: result.registration })
                    toast.warning('Already Admitted')
                    stopScanning()
                } else {
                    toast.error(result.error || 'Admission Failed')
                }
            }
        } catch (err) {
            console.error(err)
            toast.error('Processing Error')
        }
    }

    const startScanning = async () => {
        setCameraError(null)
        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader")
            }

            setScanning(true)

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Success
                    let registrationId = decodedText
                    try {
                        const json = JSON.parse(decodedText)
                        if (json.id) registrationId = json.id
                    } catch (e) {
                        // Not JSON, use as is
                    }
                    processRegistrationId(registrationId)
                },
                (errorMessage) => {
                    // Ignore frame errors
                }
            )
        } catch (err: any) {
            console.error("Error starting scanner", err)
            setScanning(false)
            setCameraError("Could not access camera. Please ensure you have granted permission and are using a mobile device with a back camera.")
            toast.error("Camera Access Failed")
        }
    }

    const stopScanning = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop()
                setScanning(false)
            } catch (err) {
                console.error("Failed to stop scanner", err)
            }
        } else {
            setScanning(false)
        }
    }

    const handleNext = () => {
        setScanResult(null)
        // User must click start again to avoid loop issues
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
                    <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-lg flex flex-col">

                        {/* Camera Area */}
                        <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
                            <div id="reader" className="w-full h-full"></div>

                            {!scanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6 text-center">
                                    <Camera className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-300 mb-6">Camera is inactive</p>
                                    <button
                                        onClick={startScanning}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Loader2 className="h-5 w-5" /> Start Camera
                                    </button>
                                    {cameraError && (
                                        <p className="mt-4 text-red-400 text-sm max-w-xs">{cameraError}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-100 text-center text-gray-500 text-sm border-b">
                            {scanning ? "Pointing at QR Code..." : "Click 'Start Camera' to begin scanning"}
                        </div>

                        {/* Manual Entry */}
                        <div className="p-4 bg-white">
                            <div className="relative flex items-center my-2">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-semibold">Or Manual Entry</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Reg ID (e.g. IFTAR-2026-001)"
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                >
                                    Admit
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 text-center space-y-6 animate-in fade-in zoom-in border border-gray-700">
                        {scanResult.success ? (
                            <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center ring-4 ring-green-500/10">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                        ) : (
                            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center ring-4 ring-red-500/10">
                                <XCircle className="h-16 w-16 text-red-500" />
                            </div>
                        )}

                        <div>
                            <h2 className={`text-2xl font-bold ${scanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {scanResult.message}
                            </h2>
                            {scanResult.data && (
                                <div className="mt-6 p-5 bg-gray-700/50 rounded-xl text-left space-y-3 border border-gray-600">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Name</span>
                                        <span className="font-semibold text-white">{scanResult.data.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">ID</span>
                                        <span className="font-mono text-yellow-500">{scanResult.data.registrationId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Mobile</span>
                                        <span className="text-white">{scanResult.data.mobile}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Scan Next Participant
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
