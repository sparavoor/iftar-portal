'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import Image from 'next/image'
import Link from 'next/link'
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
                // Increased resolution for better quality
                const url = await QRCode.toDataURL(qrData, { width: 600, margin: 2 })
                setQrCodeUrl(url)
            } catch (err) {
                console.error(err)
                toast.error('Failed to generate QR Code')
            }
        }
        generateQR()
    }, [registration])

    const downloadQR = () => {
        try {
            if (!qrCodeUrl) {
                toast.error('QR Code not ready yet')
                return
            }
            const link = document.createElement('a')
            link.href = qrCodeUrl
            link.download = `iftar-qr-${registration.registrationId}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('QR Image downloaded')
        } catch (error) {
            console.error('Download QR Error:', error)
            toast.error('Failed to download QR Image')
        }
    }

    const downloadPDF = () => {
        try {
            const doc = new jsPDF()

            // Card Border
            doc.setDrawColor(6, 78, 59) // Dark Green
            doc.setLineWidth(1)
            doc.rect(15, 15, 180, 267) // Page border

            // Header Background
            doc.setFillColor(6, 78, 59) // Dark Green
            doc.rect(15, 15, 180, 40, 'F')

            // Header Text
            doc.setTextColor(255, 255, 255)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(24)
            doc.text('Iftar Participation 2026', 105, 35, { align: 'center' })

            doc.setFontSize(14)
            doc.setFont('helvetica', 'normal')
            doc.text('Official Registration Slip', 105, 48, { align: 'center' })

            // Registration ID Box
            doc.setFillColor(240, 253, 244) // Light Green
            doc.setDrawColor(22, 163, 74) // Green
            doc.roundedRect(40, 70, 130, 25, 3, 3, 'FD')

            doc.setTextColor(22, 163, 74)
            doc.setFont('courier', 'bold')
            doc.setFontSize(20)
            doc.text(registration.registrationId, 105, 87, { align: 'center' })

            // Details Section
            doc.setTextColor(60, 60, 60)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.text('Participant Details', 25, 115)
            doc.line(25, 118, 185, 118) // Separator

            // Details Grid
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(12)

            const startY = 130
            const lineHeight = 12

            // Name
            doc.text('Name:', 30, startY)
            doc.setFont('helvetica', 'bold')
            doc.text(registration.name, 80, startY)
            doc.setFont('helvetica', 'normal')

            // Mobile
            doc.text('Mobile:', 30, startY + lineHeight)
            doc.setFont('helvetica', 'bold')
            doc.text(registration.mobile, 80, startY + lineHeight)
            doc.setFont('helvetica', 'normal')

            // Dept
            doc.text('Department:', 30, startY + lineHeight * 2)
            doc.setFont('helvetica', 'bold')
            doc.text(registration.class || 'N/A', 80, startY + lineHeight * 2)
            doc.setFont('helvetica', 'normal')

            // Year
            doc.text('Year:', 30, startY + lineHeight * 3)
            doc.setFont('helvetica', 'bold')
            doc.text(registration.year || 'N/A', 80, startY + lineHeight * 3)

            // QR Code Section
            if (qrCodeUrl) {
                try {
                    doc.addImage(qrCodeUrl, 'PNG', 75, 200, 60, 60)
                    doc.setFontSize(10)
                    doc.setTextColor(100, 100, 100)
                    doc.text('Scan this QR code at the entrance', 105, 270, { align: 'center' })
                } catch (imgError) {
                    console.error('Error adding image to PDF:', imgError)
                    // Continue without image if it fails
                }
            }

            // Footer
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' })

            doc.save(`iftar-slip-${registration.registrationId}.pdf`)
            toast.success('Registration Slip downloaded')
        } catch (error) {
            console.error('Download PDF Error:', error)
            toast.error('Failed to download PDF')
        }
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
                        <Image
                            src={qrCodeUrl}
                            alt="QR Code"
                            width={192}
                            height={192}
                            className="w-48 h-48 border-4 border-green-50 rounded-lg shadow-sm"
                            unoptimized
                        />
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
                        <span>Download QR Image</span>
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
                    <Link href="/" className="text-xs text-green-600 hover:underline">Register Another Person</Link>
                </div>
            </div>
        </div>
    )
}
