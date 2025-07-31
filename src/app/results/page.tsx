'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import AssessmentResults from '@/components/AssessmentResults'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function ResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Debug: Log what we're getting from URL params
  console.log('Results page - URL params:', {
    type: searchParams.get('type'),
    data: searchParams.get('data') ? 'Present' : 'Missing',
    allParams: Array.from(searchParams.entries())
  })

  // Check if we have assessment data from URL params (fresh assessment completion)
  const dataParam = searchParams.get('data')
  const score = searchParams.get('score')
  const level = searchParams.get('level') as 'Leader' | 'Advanced' | 'Developing' | 'Beginner'
  const answersParam = searchParams.get('answers')
  const questionsParam = searchParams.get('questions')

  const [loading, setLoading] = useState(true)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [savedRecommendations, setSavedRecommendations] = useState<any[]>([])

  useEffect(() => {
    if (dataParam) {
      // Fresh assessment completion - parse the data parameter
      try {
        const assessmentData = JSON.parse(dataParam)
        
        setAssessmentData({
          assessmentType: assessmentData.type, // Extract assessment type from data
          total_score: assessmentData.score,
          readiness_level: assessmentData.readinessLevel,
          answers: assessmentData.answers,
          questions: assessmentData.questions,
          completionDate: new Date(assessmentData.completionDate).toLocaleDateString(),
          isFreshAssessment: true // Mark as fresh assessment
        })
        setLoading(false)
      } catch (error) {
        console.error('Error parsing data parameter:', error)
        router.push('/dashboard')
      }
    } else if (score && level && answersParam && questionsParam) {
      // Legacy format - use individual URL params
      try {
        const answers = JSON.parse(answersParam)
        const questions = JSON.parse(questionsParam)
        
        setAssessmentData({
          total_score: parseInt(score),
          readiness_level: level,
          answers,
          questions,
          completionDate: new Date().toLocaleDateString(),
          isFreshAssessment: true // Mark as fresh assessment
        })
        setLoading(false)
      } catch (error) {
        console.error('Error parsing URL params:', error)
        router.push('/dashboard')
      }
    } else {
      // Viewing existing results - fetch from database
      fetchExistingResults()
    }
  }, [dataParam, score, level, answersParam, questionsParam])

  const fetchExistingResults = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('User authentication error:', userError)
        router.push('/')
        return
      }

      // For existing results, we need to determine the assessment type
      // This is a fallback for viewing existing results
      const assessmentType = 'c_level' // Default fallback

      // Fetch assessment data
      const { data: scores, error: scoresError } = await supabase
        .from('assessment_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('assessment_type', assessmentType)
        .order('completed_at', { ascending: false })
        .limit(1)

      if (scoresError) {
        console.error('Error fetching scores:', scoresError)
        return
      }

      if (!scores || scores.length === 0) {
        router.push('/dashboard')
        return
      }

      // Fetch assessment answers
      const { data: answersData, error: answersError } = await supabase
        .from('assessment_responses')
        .select('question_id, answer')
        .eq('user_id', user.id)
        .eq('assessment_type', assessmentType)
        .order('question_id')

      if (answersError) {
        console.error('Error fetching answers:', answersError)
        return
      }

      // Convert answers to the format expected by the component
      const answers = answersData.reduce((acc, item) => {
        acc[item.question_id] = item.answer
        return acc
      }, {} as Record<number, number>)

      // Get questions from data file
      const { cLevelQuestions, shopfloorQuestions } = await import('@/data/assessments')
      const questions = assessmentType === 'c_level' ? cLevelQuestions : shopfloorQuestions

      // Fetch saved AI recommendations
      const { data: aiRecommendations, error: aiError } = await supabase
        .from('ai_recommendations')
        .select('recommendations')
        .eq('user_id', user.id)
        .eq('assessment_type', assessmentType)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!aiError && aiRecommendations && aiRecommendations.length > 0) {
        setSavedRecommendations(aiRecommendations[0].recommendations || [])
      }

      setAssessmentData({
        assessmentType: assessmentType, // Include assessment type
        total_score: scores[0].total_score,
        readiness_level: scores[0].readiness_level,
        answers,
        questions,
        completionDate: new Date(scores[0].completed_at).toLocaleDateString(),
        isFreshAssessment: false // Mark as existing results
      })

    } catch (error) {
      console.error('Error fetching existing results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-body text-gray-300">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-gray-300 mb-4">No assessment results found.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <AssessmentResults
      assessmentType={assessmentData.assessmentType}
      totalScore={assessmentData.total_score}
      readinessLevel={assessmentData.readiness_level}
      answers={assessmentData.answers}
      questions={assessmentData.questions}
      completionDate={assessmentData.completionDate}
      isFromAssessment={assessmentData.isFreshAssessment}
      savedRecommendations={savedRecommendations}
    />
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-body text-gray-300">Loading results...</p>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  )
} 