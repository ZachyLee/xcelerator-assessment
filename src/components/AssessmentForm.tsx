'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LikertScale from './LikertScale'
import { cLevelQuestions, shopfloorQuestions, calculateReadinessLevel } from '@/data/assessments'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

interface AssessmentFormProps {
  assessmentType: 'c_level' | 'shopfloor'
}

export default function AssessmentForm({ assessmentType }: AssessmentFormProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [loading, setLoading] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [readinessLevel, setReadinessLevel] = useState<'Beginner' | 'Developing' | 'Advanced' | 'Leader'>('Beginner')
  const [showWarning, setShowWarning] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const questions = assessmentType === 'c_level' ? cLevelQuestions : shopfloorQuestions
  const assessmentTitle = assessmentType === 'c_level' ? 'C-Level Management' : 'Shopfloor Operators'

  // Check score after 66% of questions are answered
  useEffect(() => {
    checkScoreAfter66Percent()
  }, [answers, currentQuestion, assessmentType])

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      // Hide warning if going back before 66% progress
      const questionsAnswered = Object.keys(answers).length
      const progressPercentage = (questionsAnswered / questions.length) * 100
      if (progressPercentage < 66) {
        setShowWarning(false)
      }
    }
  }

  const calculateScore = () => {
    const total = Object.values(answers).reduce((sum, answer) => sum + answer, 0)
    setTotalScore(total)
    setReadinessLevel(calculateReadinessLevel(total, assessmentType))
  }

  const checkScoreAfter66Percent = () => {
    const questionsAnswered = Object.keys(answers).length
    const totalQuestions = questions.length
    const progressPercentage = (questionsAnswered / totalQuestions) * 100
    
    // Check if we've answered 66% or more of the questions
    if (progressPercentage >= 66) {
      const scoreSoFar = Object.values(answers).reduce((sum, answer) => sum + answer, 0)
      const maxPossibleScoreSoFar = questionsAnswered * 5 // questions answered * 5 points each
      const scorePercentage = (scoreSoFar / maxPossibleScoreSoFar) * 100
      
      if (scorePercentage <= 33) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }
  }

  const submitAssessment = async () => {
    // Prevent multiple submissions
    if (loading || isSubmitted) {
      return
    }
    
    setLoading(true)
    setIsSubmitted(true)
    
    try {
      // Calculate the final score before submission
      const finalScore = Object.values(answers).reduce((sum, answer) => sum + answer, 0)
      const finalReadinessLevel = calculateReadinessLevel(finalScore, assessmentType)
      
            const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      if (!user) throw new Error('User not authenticated')
      
      // Check for recent submissions to prevent duplicates
      const { data: recentSubmissions } = await supabase
        .from('assessment_scores')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('assessment_type', assessmentType)
        .gte('created_at', new Date(Date.now() - 30000).toISOString()) // Last 30 seconds
        .order('created_at', { ascending: false })
        .limit(1)

      if (recentSubmissions && recentSubmissions.length > 0) {
        throw new Error('Assessment already submitted recently. Please wait before submitting again.')
      }

      // Save individual answers to assessment_responses table
      const answerPromises = Object.entries(answers).map(([questionId, answer]) =>
        supabase.from('assessment_responses').insert({
          user_id: user.id,
          assessment_type: assessmentType,
          question_id: parseInt(questionId),
          answer: answer
        })
      )

      await Promise.all(answerPromises)

      // Validate score before saving
      if (finalScore < 12 || finalScore > 60) {
        console.error('Invalid score:', finalScore, 'Score must be between 12 and 60')
        throw new Error(`Invalid score: ${finalScore}. Score must be between 12 and 60.`)
      }

      // Save overall score to assessment_scores table
      const { error: scoreError } = await supabase.from('assessment_scores').insert({
        user_id: user.id,
        assessment_type: assessmentType,
        total_score: finalScore,
        readiness_level: finalReadinessLevel,
        completed_at: new Date().toISOString()
      })

      if (scoreError) {
        console.error('Error saving assessment score:', scoreError)
        throw new Error(`Failed to save assessment score: ${scoreError.message}`)
      }

      // Fetch existing profile to preserve user background data
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('user_role, user_department, annual_revenue, industry')
        .eq('id', user.id)
        .single()

      if (profileFetchError) {
        console.error('Error fetching existing profile:', profileFetchError)
        if (profileFetchError.code !== 'PGRST116') {
          console.error('Profile fetch error details:', {
            code: profileFetchError.code,
            message: profileFetchError.message,
            details: profileFetchError.details
          })
        }
      }

      // Prepare profile update data, preserving existing background info
      let profileUpdateData: any = {
        id: user.id,
        [`${assessmentType}_total_score`]: finalScore,
        [`${assessmentType}_readiness_level`]: finalReadinessLevel,
        [`${assessmentType}_assessment_answers`]: answers,
        updated_at: new Date().toISOString()
      }

      if (existingProfile) {
        // Preserve existing background data
        profileUpdateData = {
          ...profileUpdateData,
          user_role: existingProfile.user_role,
          user_department: existingProfile.user_department,
          annual_revenue: existingProfile.annual_revenue,
          industry: existingProfile.industry
        }
      } else {
        // No existing profile found, create basic profile
        profileUpdateData = {
          ...profileUpdateData,
          created_at: new Date().toISOString()
        }
      }

      // Update or create profile with assessment data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdateData)

      if (profileError) {
        console.error('Failed to save assessment to profile:', profileError)
        console.error('Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details
        })
        throw new Error(`Failed to save assessment data: ${profileError.message}`)
      }

      // Redirect to results page with assessment data
      const assessmentData = {
        type: assessmentType,
        score: finalScore,
        readinessLevel: finalReadinessLevel,
        answers: answers,
        questions: questions,
        completionDate: new Date().toISOString()
      }

      const queryParams = new URLSearchParams({
        data: JSON.stringify(assessmentData)
      })

      router.push(`/results?${queryParams.toString()}`)

    } catch (error) {
      console.error('Error submitting assessment:', error)
      setLoading(false)
      setIsSubmitted(false)
      alert(error instanceof Error ? error.message : 'Failed to submit assessment')
    }
  }

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100
  }

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'Leader': return 'status-success'
      case 'Advanced': return 'status-info'
      case 'Developing': return 'status-warning'
      case 'Beginner': return 'status-error'
      default: return 'status-info'
    }
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-outline inline-flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-heading mb-2">
            {assessmentTitle} Assessment
          </h1>
          <p className="text-body text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="card mb-6 slide-up">
          <div className="flex justify-between items-center mb-3">
            <span className="text-caption font-medium text-gray-300">Progress</span>
            <span className="text-caption font-medium text-gray-300">
              {Math.round(getProgressPercentage())}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill progress-fill-info"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Warning Message */}
        {showWarning && (
          <div className="card bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 mb-6 slide-up">
            <div className="flex items-start">
              <div className="icon-container icon-warning mr-3 flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-body font-medium text-white mb-1">
                  Assessment Progress Check
                </h3>
                <p className="text-caption text-gray-300">
                  Your readiness is at a basic level and more foundational work is required first.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="slide-up">
          <LikertScale
            questionId={currentQuestionData.id}
            question={currentQuestionData.question}
            category={currentQuestionData.category}
            value={answers[currentQuestionData.id] || 0}
            onChange={handleAnswerChange}
          />
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 glass border-t border-white/10 py-4 z-10 mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={async () => {
                  if (loading) return // Prevent double submission
                  calculateScore()
                  await submitAssessment()
                }}
                disabled={Object.keys(answers).length < questions.length || loading || isSubmitted}
                className="btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner h-4 w-4 mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Assessment
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!answers[questions[currentQuestion].id]}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 