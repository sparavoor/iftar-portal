'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import { Download, FileText, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Registration {
    id: string
    registrationId: string
    name: string
    mobile: string
    class: string | null
    year: string | null
    createdAt: string
}

export default function SuccessCard({ registration }: { registration: Registration }) {
    const [qrCodeUrl, setQrCodeUrl] = useState('')

    useEffect(() => {
        const generateQR = async () => {
            try {
                const qrData = JSON.stringify({
                    id: registration.registrationId,
                    name: registration.name,
                    mobile: registration.mobile,
                })
                const url = await QRCode.toDataURL(qrData, { width: 300, margin: 2 })
                setQrCodeUrl(url)
            } catch (err) {
                console.error(err)
                toast.error('Failed to generate QR Code')
            }
        }
        generateQR()
    }, [registration])

    const downloadQR = () => {
        if (!qrCodeUrl) return
        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = `iftar-qr-${registration.registrationId}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const downloadPDF = () => {
        const doc = new jsPDF()

        // Header
        doc.setFillColor(6, 78, 59) // Green
        doc.rect(0, 0, 210, 40, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.text('Iftar Participation 2026', 105, 20, { align: 'center' })
        doc.setFontSize(12)
        doc.text('Registration Slip', 105, 30, { align: 'center' })

        // Details
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.text(`Registration ID: ${registration.registrationId}`, 20, 60)
        doc.text(`Name: ${registration.name}`, 20, 75)
        doc.text(`Mobile: ${registration.mobile}`, 20, 90)
        doc.text(`Class: ${registration.class || 'N/A'}`, 20, 105)
        doc.text(`Year: ${registration.year || 'N/A'}`, 20, 120)

        // QR Code
        if (qrCodeUrl) {
            doc.addImage(qrCodeUrl, 'PNG', 130, 50, 60, 60)
        }

        // Footer
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Please show this QR code at the entrance.', 105, 140, { align: 'center' })
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280)

        doc.save(`iftar-slip-${registration.registrationId}.pdf`)
    }

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
            <div className="bg-green-800 p-6 text-center text-white">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-12 w-12 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold">Registration Successful!</h2>
                <p className="text-green-100 mt-2">Your registration ID is <br /><span className="font-mono bg-green-900/50 px-2 py-1 rounded text-yellow-400 text-lg">{registration.registrationId}</span></p>
            </div>

            <div className="p-6 space-y-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm text-gray-500 font-medium">Your Admit QR Code</p>
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border-4 border-green-50 rounded-lg shadow-sm" />
                    ) : (
                        <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg" />
                    )}
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm py-1 border-b px-2">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-900">{registration.name}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b px-2">
                        <span className="text-gray-500">Mobile</span>
                        <span className="font-medium text-gray-900">{registration.mobile}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={downloadQR}
                        className="flex items-center justify-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span>Save QR</span>
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center justify-center space-x-2 bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Download Slip</span>
                    </button>
                </div>

                <div className="text-center">
                    <a href="/" className="text-xs text-green-600 hover:underline">Register Another Person</a>
                </div>
            </div>
        </div>
    )
}
