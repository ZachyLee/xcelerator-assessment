'use client'

import { useState, useEffect } from 'react'

interface LikertScaleProps {
  questionId: number
  question: string
  category: string
  value: number
  onChange: (questionId: number, value: number) => void
}

export default function LikertScale({ questionId, question, category, value, onChange }: LikertScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const [example, setExample] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Reset example when question changes
  useEffect(() => {
    setExample(null)
    setCopied(false)
  }, [questionId])

  const scaleLabels = [
    { value: 1, label: 'Not at all', description: 'No implementation or awareness' },
    { value: 2, label: 'Minimal', description: 'Basic awareness, no implementation' },
    { value: 3, label: 'Somewhat', description: 'Partial implementation or planning' },
    { value: 4, label: 'Well', description: 'Good implementation and understanding' },
    { value: 5, label: 'Excellent', description: 'Full implementation and mastery' }
  ]

  const handleShowExample = async () => {
    setLoading(true)
    setCopied(false)
    setExample(null)
    try {
      const res = await fetch('/api/best-in-class-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      if (res.ok && data.example) {
        setExample(data.example)
      } else {
        setExample(data.error || 'Failed to fetch example.')
      }
    } catch (err) {
      setExample('Failed to fetch example.')
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (example) {
      navigator.clipboard.writeText(example)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="card card-hover">
      <div className="mb-4">
        <span className="status-badge status-info mb-2">
          {category}
        </span>
        <h3 className="text-subheading mb-2">
          Question {questionId}
        </h3>
        <p className="text-body text-gray-300">{question}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {scaleLabels.map((item) => (
            <button
              key={item.value}
              onClick={() => onChange(questionId, item.value)}
              onMouseEnter={() => setHoveredValue(item.value)}
              onMouseLeave={() => setHoveredValue(null)}
              className={`flex flex-col items-center justify-center h-20 w-16 p-2 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                ${value === item.value
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg'
                  : hoveredValue === item.value
                  ? 'glass border-blue-400/50 text-blue-400'
                  : 'glass border-white/10 text-gray-300 hover:border-white/20'}
              `}
              style={{ minHeight: '5rem', minWidth: '4rem' }}
            >
              <span className="text-lg font-bold mb-0.5">{item.value}</span>
              <span className="text-[10px] font-medium text-center">{item.label}</span>
            </button>
          ))}
        </div>

        {hoveredValue && (
          <div className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 text-center">
            <p className="text-caption text-blue-300">
              {scaleLabels.find(item => item.value === hoveredValue)?.description}
            </p>
          </div>
        )}

        <div className="flex flex-col items-start mt-4">
          <button
            type="button"
            onClick={handleShowExample}
            className="btn-outline text-sm disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner h-4 w-4 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Give me a best-in-class example
              </>
            )}
          </button>
          {example && (
            <div className="mt-3 w-full card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <span className="text-caption text-green-300 flex-1">{example}</span>
              <button
                type="button"
                onClick={handleCopy}
                  className="btn-secondary text-xs ml-2 mt-2 sm:mt-0"
                >
                  {copied ? (
                    <>
                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
              </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 