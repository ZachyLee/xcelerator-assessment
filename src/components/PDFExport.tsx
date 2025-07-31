'use client'

import { useState } from 'react'
import { Download, FileText, CheckCircle } from 'lucide-react'

interface PDFExportProps {
  assessmentType: 'c_level' | 'shopfloor'
  totalScore: number
  readinessLevel: string
  answers: { [key: number]: number }
  questions: any[]
  onExport: () => void
}

export default function PDFExport({ 
  assessmentType, 
  totalScore, 
  readinessLevel, 
  answers, 
  questions, 
  onExport 
}: PDFExportProps) {
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setExported(false)
    setError(null)
    try {
      await onExport()
      setExported(true)
      // Reset success message after 3 seconds
      setTimeout(() => setExported(false), 3000)
    } catch (error) {
      console.error('PDF export failed:', error)
      setError('Failed to generate PDF. Please try again.')
      // Reset error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="btn-primary flex items-center disabled:opacity-50"
        title="Export assessment results as PDF"
      >
        {exporting ? (
          <>
            <div className="loading-spinner h-4 w-4 mr-2"></div>
            Generating PDF...
          </>
        ) : exported ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            PDF Downloaded!
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </>
        )}
      </button>
      
      {exported && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium animate-fade-in">
          PDF successfully generated!
        </div>
      )}
      
      {error && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}
    </div>
  )
} 