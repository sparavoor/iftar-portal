'use client'

import { Download, FileText, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useState } from 'react'
import { toast } from 'sonner'

interface Registration {
    id: string
    registrationId: string
    name: string
    mobile: string
    department: string | null
    year: string | null
    admitted: boolean
    admittedAt: string | null
    createdAt: string
}

export default function DashboardActions({ date }: { date?: string }) {
    const [loading, setLoading] = useState(false)

    const fetchData = async (): Promise<Registration[]> => {
        const url = date ? `/api/registrations?date=${date}` : '/api/registrations'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch data')
        const data = await res.json()
        return data.registrations
    }

    const exportExcel = async () => {
        try {
            setLoading(true)
            setLoading(true)
            const rawData = await fetchData()

            // Map data for Excel to match desired column order
            const data = rawData.map((reg) => ({
                "Registration ID": reg.registrationId,
                "Mobile": reg.mobile,
                "Name": reg.name,
                "Department": reg.department,
                "Year": reg.year,
                "Status": reg.admitted ? "Admitted" : "Pending",
                "Admitted At": reg.admittedAt ? new Date(reg.admittedAt).toLocaleString() : '',
                "Created At": new Date(reg.createdAt).toLocaleString()
            }))

            const worksheet = XLSX.utils.json_to_sheet(data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations")

            XLSX.writeFile(workbook, "iftar_registrations.xlsx")
            toast.success('Excel exported successfully')
        } catch (error) {
            toast.error('Export failed')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const exportPDF = async () => {
        try {
            setLoading(true)
            const data = await fetchData()

            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Iftar Participation Report 2026', 14, 22)
            doc.setFontSize(11)
            doc.setTextColor(100)
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

            const tableData = data.map((reg) => [
                reg.registrationId,
                reg.mobile,
                reg.name,
                reg.department || '-',
                reg.year || '-',
                reg.admitted ? 'Admitted' : 'Pending',
                reg.admittedAt ? new Date(reg.admittedAt).toLocaleTimeString() : '-'
            ])

            autoTable(doc, {
                head: [['ID', 'Mobile', 'Name', 'Dept', 'Year', 'Status', 'Admitted At']],
                body: tableData,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [6, 78, 59] }, // Green
            })

            doc.save('iftar_report.pdf')
            toast.success('PDF exported successfully')
        } catch (error) {
            toast.error('Export failed')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex space-x-3">
            <button
                onClick={exportExcel}
                disabled={loading}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Export Excel</span>
            </button>
            <button
                onClick={exportPDF}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium transition"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                <span>Download PDF</span>
            </button>
        </div>
    )
}
