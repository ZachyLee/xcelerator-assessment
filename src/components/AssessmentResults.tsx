'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react'
import ReadinessActionPlan from './ReadinessActionPlan'
import AIRecommendations from './AIRecommendations'
import PDFExport from './PDFExport'
import { generateAssessmentPDF } from '@/lib/pdfExport'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AssessmentResultsProps {
  assessmentType: 'c_level' | 'shopfloor'
  totalScore: number
  readinessLevel: 'Leader' | 'Advanced' | 'Developing' | 'Beginner'
  answers: Record<number, number>
  questions: any[]
  completionDate?: string
  isFromAssessment?: boolean
  savedRecommendations?: any[]
}

export default function AssessmentResults({
  assessmentType,
  totalScore,
  readinessLevel,
  answers,
  questions,
  completionDate,
  isFromAssessment = false,
  savedRecommendations = []
}: AssessmentResultsProps) {
  const router = useRouter()
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])

  // Debug: Log the data being passed to AIRecommendations
  console.log('AssessmentResults - Data being passed to AIRecommendations:', {
    answers: answers ? Object.keys(answers).length + ' answers' : 'No answers',
    assessmentType: assessmentType || 'UNDEFINED',
    readinessLevel: readinessLevel || 'UNDEFINED',
    isFromAssessment,
    savedRecommendationsCount: savedRecommendations.length,
    assessmentTypeType: typeof assessmentType,
    readinessLevelType: typeof readinessLevel
  })

  const assessmentTitle = assessmentType === 'c_level' ? 'C-Level Management' : 'Shopfloor Operators'

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'Leader': return 'status-success'
      case 'Advanced': return 'status-info'
      case 'Developing': return 'status-warning'
      case 'Beginner': return 'status-error'
      default: return 'status-info'
    }
  }

  const handleRetakeAssessment = () => {
    if (isFromAssessment) {
      // If we're already in the assessment form, reset it
      window.location.reload()
    } else {
      // Navigate to the assessment page
      router.push(`/assessment/${assessmentType === 'c_level' ? 'c-level' : 'shopfloor'}`)
    }
  }

  return (
    <div className="min-h-screen bg-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="card card-hover">
          <div className="text-center mb-8 fade-in">
            <div className="icon-container icon-success mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-display mb-2">
              {isFromAssessment ? 'Assessment Complete! 🎉' : 'Assessment Results 📊'}
            </h1>
            <p className="text-body text-gray-300">
              {assessmentTitle} Assessment
            </p>
            {completionDate && (
              <p className="text-caption text-gray-400 mt-2">
                Completed on {completionDate}
              </p>
            )}
          </div>

          <div className="summary-grid mb-8">
            <div className="card card-hover text-center">
              <div className="icon-container icon-primary mx-auto mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-subheading mb-2">Total Score</h3>
              <p className="text-metric text-metric-primary">{totalScore}/60</p>
              <p className="text-caption text-gray-400 mt-2">
                {Math.round((totalScore / 60) * 100)}% of maximum score
              </p>
            </div>

            <div className="card card-hover text-center">
              <div className="icon-container icon-success mx-auto mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-subheading mb-2">Readiness Level</h3>
              <span className={`status-badge ${getReadinessColor(readinessLevel)}`}>
                {readinessLevel}
              </span>
              <p className="text-caption mt-2">
                {readinessLevel === 'Leader' && 'Industry leader, driving innovation'}
                {readinessLevel === 'Advanced' && 'Strong foundation, actively implementing'}
                {readinessLevel === 'Developing' && 'Growing awareness, some initiatives in place'}
                {readinessLevel === 'Beginner' && 'Basic understanding, needs foundational work'}
              </p>
            </div>
          </div>

          {/* Readiness Action Plan */}
          <ReadinessActionPlan readinessLevel={readinessLevel} />

          {/* AI-Powered Recommendations */}
          <AIRecommendations 
            answers={answers}
            assessmentType={assessmentType}
            readinessLevel={readinessLevel}
            onRecommendationsGenerated={async (recommendations) => {
              setAiRecommendations(recommendations)
              
              // Save AI recommendations to database
              try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user && recommendations.length > 0) {
                  const { error } = await supabase.from('ai_recommendations').insert({
                    user_id: user.id,
                    assessment_type: assessmentType,
                    recommendations: recommendations,
                    readiness_level: readinessLevel,
                    total_score: totalScore
                  })
                  
                  if (error) {
                    console.error('Error saving AI recommendations:', error)
                  } else {
                    console.log('AI recommendations saved to database successfully')
                  }
                }
              } catch (error) {
                console.error('Error saving AI recommendations:', error)
              }
            }}
            disableRegeneration={!isFromAssessment}
            savedRecommendations={isFromAssessment ? [] : savedRecommendations}
          />

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <PDFExport
              assessmentType={assessmentType}
              totalScore={totalScore}
              readinessLevel={readinessLevel}
              answers={answers}
              questions={questions}
                          onExport={() => {
              // Use current AI recommendations if available, otherwise use saved recommendations
              const recommendationsToInclude = aiRecommendations.length > 0 ? aiRecommendations : savedRecommendations
              console.log('PDF Export - AI recommendations to include:', recommendationsToInclude.length)
              
              generateAssessmentPDF({
                assessmentType,
                totalScore,
                readinessLevel,
                answers,
                questions,
                completionDate: completionDate || new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                aiRecommendations: recommendationsToInclude
              })
            }}
            />
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={handleRetakeAssessment}
              className="btn-secondary flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isFromAssessment ? 'Take Assessment Again' : 'Retake Assessment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 