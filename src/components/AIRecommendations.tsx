'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Clock, Target, TrendingUp } from 'lucide-react'

interface AIRecommendation {
  title: string
  description: string
  priority: string
  timeline: string
  impact: string
}

interface AIRecommendationsProps {
  answers: { [key: number]: number }
  assessmentType: 'c_level' | 'shopfloor'
  readinessLevel: 'Beginner' | 'Developing' | 'Advanced' | 'Leader'
  onRecommendationsGenerated?: (recommendations: AIRecommendation[]) => void
  disableRegeneration?: boolean
  savedRecommendations?: AIRecommendation[]
}

function tryExtractRecommendations(raw: AIRecommendation[]): AIRecommendation[] {
  // If the first recommendation's description contains a JSON string, try to extract and parse it
  if (
    raw.length === 1 &&
    raw[0].title === 'AI Analysis Complete' &&
    typeof raw[0].description === 'string' &&
    raw[0].description.includes('recommendations')
  ) {
    // Try to extract JSON from the description
    const match = raw[0].description.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed.recommendations
        }
      } catch {}
    }
  }
  return raw
}

export default function AIRecommendations({ answers, assessmentType, readinessLevel, onRecommendationsGenerated, disableRegeneration = false, savedRecommendations = [] }: AIRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(savedRecommendations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-expand if we have saved recommendations
  useEffect(() => {
    if (savedRecommendations.length > 0) {
      setIsExpanded(true)
    }
  }, [savedRecommendations])

  const generateRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    // Debug: Log the data being sent
    console.log('Sending to AI recommendations API:', {
      answers,
      assessmentType,
      readinessLevel
    })
    
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          assessmentType,
          readinessLevel
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('AI recommendations API error response:', data)
        throw new Error(data.error || 'Failed to generate recommendations')
      }

      const recommendationsData = data.recommendations || []
      setRecommendations(recommendationsData)
      setIsExpanded(true)
      
      // Call the callback to pass recommendations to parent component
      if (onRecommendationsGenerated) {
        onRecommendationsGenerated(recommendationsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTimelineIcon = (timeline: string) => {
    if (timeline.includes('1-3')) return <Clock className="h-4 w-4" />
    if (timeline.includes('3-6')) return <Target className="h-4 w-4" />
    if (timeline.includes('6+')) return <TrendingUp className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  // Fallback: try to extract recommendations if the AI returned a JSON string in the description
  const displayRecommendations = tryExtractRecommendations(recommendations)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {disableRegeneration ? (
        // Show saved recommendations without regeneration ability
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-lg font-semibold text-gray-900">
              AI-Powered Recommendations
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
      ) : (
        // Show generation button for fresh assessments
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-lg font-semibold text-gray-900">
              {loading ? 'Generating AI Recommendations...' : 'Get AI-Powered Custom Recommendations'}
            </span>
          </div>
          {isExpanded && !loading ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isExpanded && displayRecommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Customized Recommendations Based on Your Assessment
          </h3>
          
          <div className="space-y-6">
            {displayRecommendations.map((recommendation, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {recommendation.title}
                    </h4>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority}
                  </span>
                </div>
                
                <div className="ml-11 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">What to do:</h5>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {recommendation.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        {getTimelineIcon(recommendation.timeline)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</p>
                        <p className="text-sm font-medium text-gray-900">{recommendation.timeline}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Impact</p>
                        <p className="text-sm font-medium text-gray-900">{recommendation.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> These recommendations are generated based on your specific assessment responses and lowest scoring areas. 
              They are designed to address your organization's unique challenges and opportunities for digital transformation improvement.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 