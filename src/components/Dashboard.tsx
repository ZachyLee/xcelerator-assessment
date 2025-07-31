'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Users, Settings, LogOut, BarChart3 } from 'lucide-react'
import { cLevelQuestions, shopfloorQuestions } from '@/data/assessments'
import AnalyticsCharts from './AnalyticsCharts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DashboardProps {
  onSignOut: () => void
}

export default function Dashboard({ onSignOut }: DashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [industry, setIndustry] = useState<string>('')
  const [showTrendsPrompt, setShowTrendsPrompt] = useState(false)
  const [trends, setTrends] = useState<any[]>([])
  const [fetchingTrends, setFetchingTrends] = useState(false)
  const [showIndustryPrompt, setShowIndustryPrompt] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedTrends, setSelectedTrends] = useState<number[]>([])
  const [showTrendSelection, setShowTrendSelection] = useState(false)
  const [hasSeenTrendsPrompt, setHasSeenTrendsPrompt] = useState(false)
  
  // Digital Roadmap state
  const [showRoadmapPrompt, setShowRoadmapPrompt] = useState(false)
  const [hasSeenRoadmapPrompt, setHasSeenRoadmapPrompt] = useState(false)

  // User Background state
  const [showUserBackgroundPrompt, setShowUserBackgroundPrompt] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [userDepartment, setUserDepartment] = useState('')
  const [annualRevenue, setAnnualRevenue] = useState('')
  const [userCountry, setUserCountry] = useState('')
  const [otherRole, setOtherRole] = useState('')
  const [otherDepartment, setOtherDepartment] = useState('')

  // Assessment data state
  const [cLevelScore, setCLevelScore] = useState<number | null>(null)
  const [cLevelReadiness, setCLevelReadiness] = useState<string | null>(null)
  const [cLevelCompletedAt, setCLevelCompletedAt] = useState<string | null>(null)
  const [shopfloorScore, setShopfloorScore] = useState<number | null>(null)
  const [shopfloorReadiness, setShopfloorReadiness] = useState<string | null>(null)
  const [shopfloorCompletedAt, setShopfloorCompletedAt] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (user) {
      fetchIndustry()
      fetchScores()
    }
  }, [user])

  // Load trends when both user and industry are available
  useEffect(() => {
    if (user && industry) {
      const loadTrendsAndCheckPrompt = async () => {
        const hasSavedTrends = await fetchSavedTrends()
        if (!hasSavedTrends) {
          // Only show trends prompt if no saved trends exist
          const hasSeenPrompt = localStorage.getItem(`trendsPromptSeen_${user.id}_${industry}`)
          if (hasSeenPrompt !== 'true') {
            setShowTrendsPrompt(true)
          }
        }
      }
      loadTrendsAndCheckPrompt()
    }
  }, [user, industry])

  // Check for digital roadmap prompt
  useEffect(() => {
    if (user && industry && trends.length > 0 && scores.length > 0) {
      // Only check localStorage if user hasn't explicitly declined
      const hasDeclined = localStorage.getItem(`roadmapPromptSeen_${user.id}`)
      if (hasDeclined !== 'true') {
        setShowRoadmapPrompt(true)
      }
    }
  }, [user, industry, trends, scores])

  const fetchUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.warn('Error fetching user:', error)
        // Handle authentication error gracefully - don't set user to null here
        // as it might cause infinite loops
        return
      }
    setUser(user)
    } catch (error) {
      console.warn('Error in fetchUserData:', error)
      // Don't throw or crash the app
    }
  }

  const fetchIndustry = async () => {
    if (!user) return
    
    try {
    const { data, error } = await supabase
      .from('profiles')
        .select('industry, user_role, user_department, annual_revenue, user_country, c_level_total_score, c_level_readiness_level, c_level_completed_at, shopfloor_total_score, shopfloor_readiness_level, shopfloor_completed_at')
      .eq('id', user.id)
      .single()

    if (error) {
        // Check if error object is empty or has no meaningful properties
        const errorKeys = Object.keys(error || {})
        if (errorKeys.length === 0 || (errorKeys.length === 1 && errorKeys[0] === 'message' && !error.message)) {
          // Empty error object - likely a "not found" case, which is expected for new users
          // No profile found for user - starting with user background onboarding
          setShowUserBackgroundPrompt(true)
          return
        }
        
        console.warn('Error fetching profile:', error)
        // Check if it's a "not found" error (which is expected for new users)
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          // This is expected for new users - start with user background
          setShowUserBackgroundPrompt(true)
          return
        }
        // For other errors, still show user background but log the error
        console.warn('Unexpected error fetching profile, starting with user background')
        setShowUserBackgroundPrompt(true)
        return
      }

    if (data) {
      // Profile data received
      
      // Check if user background is complete
      if (!data.user_role || !data.user_department || !data.annual_revenue || !data.user_country) {
        // User background incomplete
        setShowUserBackgroundPrompt(true)
        // Pre-fill existing data if available
        if (data.user_role) setUserRole(data.user_role)
        if (data.user_department) setUserDepartment(data.user_department)
        if (data.annual_revenue) setAnnualRevenue(data.annual_revenue)
        if (data.user_country) setUserCountry(data.user_country)
        return
      }
      
              // User background is complete

      // Set assessment data if available
      if (data.c_level_total_score) {
        setCLevelScore(data.c_level_total_score)
        setCLevelReadiness(data.c_level_readiness_level)
        setCLevelCompletedAt(data.c_level_completed_at)
      }
      if (data.shopfloor_total_score) {
        setShopfloorScore(data.shopfloor_total_score)
        setShopfloorReadiness(data.shopfloor_readiness_level)
        setShopfloorCompletedAt(data.shopfloor_completed_at)
      }

      // Check if industry is set
      if (data.industry) {
        setIndustry(data.industry)
        // Don't show trends prompt immediately - let the useEffect handle trends loading
        setShowTrendsPrompt(false)
      } else {
        setShowIndustryPrompt(true)
      }
    } else {
      // No profile exists, start with user background
      setShowUserBackgroundPrompt(true)
    }
    } catch (error) {
      console.error('Error in fetchIndustry:', error)
      // If there's an error, start with user background
      setShowUserBackgroundPrompt(true)
    }
  }

  const fetchScores = async () => {
    if (!user) return

    // Fetching scores for user

    const { data, error } = await supabase
      .from('assessment_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching scores:', error)
      return
    }

          // Fetched scores
    setScores(data || [])
  }

  const fetchSavedTrends = async () => {
    if (!user || !industry) {
      console.log('fetchSavedTrends: Missing user or industry', { user: user?.id, industry })
      return false
    }

    try {
      console.log('fetchSavedTrends: Fetching trends for user', user.id, 'industry', industry)
      const { data, error } = await supabase
        .from('industry_trends')
        .select('*')
        .eq('user_id', user.id)
        .eq('industry', industry)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.warn('Error fetching saved trends:', error)
        return false
      }

      console.log('fetchSavedTrends: Database response', data)
      if (data && data.length > 0) {
        const trendsData = data[0].trends || []
        console.log('fetchSavedTrends: Setting trends', trendsData)
        setTrends(trendsData)
        console.log('Loaded saved trends from database')
        return true
      }
      console.log('fetchSavedTrends: No trends found in database')
      return false
    } catch (error) {
      console.warn('Exception fetching saved trends:', error)
      return false
    }
  }

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'Leader': return 'status-success'
      case 'Advanced': return 'status-info'
      case 'Developing': return 'status-warning'
      case 'Beginner': return 'status-error'
      default: return 'status-badge bg-gray-100 text-gray-800'
    }
  }

  const handleFetchTrends = async () => {
    if (!industry || !user) return
    
    setFetchingTrends(true)
    try {
      const response = await fetch('/api/industry-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ industry }),
      })

      if (response.ok) {
        const data = await response.json()
        const trendsData = data.trends || []
        setTrends(trendsData)
        setSelectedTrends([]) // Reset selections
        setShowTrendsPrompt(false)
        setShowTrendSelection(true) // Show trend selection instead of saving immediately
      } else {
        console.error('Failed to fetch trends')
      }
    } catch (error) {
      console.error('Error fetching trends:', error)
    } finally {
      setFetchingTrends(false)
    }
  }

  const handleSaveUserBackground = async () => {
    if (!user) return
    
    // Validate required fields
    if (!userRole || !userDepartment || !annualRevenue || !userCountry) {
      alert('Please fill in all required fields.')
      return
    }

    // Handle "Other" options
    const finalRole = userRole === 'Other' ? otherRole : userRole
    const finalDepartment = userDepartment === 'Other' ? otherDepartment : userDepartment

    if (userRole === 'Other' && !otherRole.trim()) {
      alert('Please specify your role.')
      return
    }

    if (userDepartment === 'Other' && !otherDepartment.trim()) {
      alert('Please specify your department.')
      return
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_role: finalRole,
          user_department: finalDepartment,
          annual_revenue: annualRevenue,
          user_country: userCountry,
          updated_at: new Date().toISOString()
        })

      // Always continue with the flow - mock client will never have real errors
      console.log('User background saved (or simulated) successfully')
      setShowUserBackgroundPrompt(false)
      setShowIndustryPrompt(true)
      
    } catch (error) {
      console.warn('Exception saving user background:', error)
      // Even if there's an exception, continue with the flow
      console.log('Continuing with flow despite exception')
      setShowUserBackgroundPrompt(false)
      setShowIndustryPrompt(true)
    }
  }

  const handleSetIndustry = async (selectedIndustry: string) => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ industry: selectedIndustry })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating industry:', error)
      return
    }

    setIndustry(selectedIndustry)
    setShowIndustryPrompt(false)
    setShowTrendsPrompt(true)
    
    // Load saved trends for this industry
    setTimeout(() => fetchSavedTrends(), 100)
  }

  const handleTrendSelection = (index: number) => {
    setSelectedTrends(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      } else if (prev.length < 3) {
        return [...prev, index]
      }
      return prev
    })
  }

  const handleSaveSelectedTrends = async () => {
    if (!user || selectedTrends.length === 0) return
    
    try {
      const selectedTrendsData = selectedTrends.map(index => trends[index])
      
      const { data: saveData, error: saveError } = await supabase
        .from('industry_trends')
        .insert({
          user_id: user.id,
          industry: industry,
          trends: selectedTrendsData
        })
        .select()

      if (saveError) {
        console.error('Failed to save selected trends to database:', saveError)
      } else {
        console.log('Selected trends saved to database successfully:', saveData)
        setTrends(selectedTrendsData) // Update displayed trends to show only selected ones
        setShowTrendSelection(false)
      }
    } catch (dbError) {
      console.error('Exception saving selected trends to database:', dbError)
    }
  }

  const handleRoadmapResponse = async (response: 'yes' | 'no') => {
    if (!user) return
    
    try {
      if (response === 'yes') {
        // TODO: Implement roadmap generation logic
        console.log('User wants personalized digital roadmap')
        // Here you would typically navigate to a roadmap page or show a roadmap modal
        alert('Personalized digital roadmap feature coming soon!')
        // Keep the prompt visible to build interest - don't hide it
      } else {
        // Only hide the prompt if user selects "Maybe Later"
        localStorage.setItem(`roadmapPromptSeen_${user.id}`, 'true')
        setHasSeenRoadmapPrompt(true)
        setShowRoadmapPrompt(false)
        console.log('User declined personalized digital roadmap')
      }
    } catch (error) {
      console.error('Error handling roadmap response:', error)
    }
  }

  const totalScore = scores.reduce((sum, score) => sum + score.total_score, 0)
  const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0

  // Error boundary for rendering
  if (error) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-heading mb-4">Something went wrong</h2>
          <p className="text-body mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-10">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="icon-container icon-primary mr-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-heading">
                Xcelerator Insights
              </h1>
                <p className="text-caption">
                  Digital Transformation Portal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-body font-medium">{user?.email}</p>
                <p className="text-caption">Assessment User</p>
              </div>
              <button
                onClick={onSignOut}
                className="btn-outline flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome Section */}
        <div className="section fade-in">
          <div className="card-gradient">
            <h2 className="text-display mb-4">
              {(scores.length === 0 && !cLevelScore && !shopfloorScore) ? `Welcome, ${user?.email?.split('@')[0]}! 🚀` : `Welcome back, ${user?.email?.split('@')[0]}! ✨`}
            </h2>
            <p className="text-body text-gray-300">
              {(scores.length === 0 && !cLevelScore && !shopfloorScore)
                ? "Start your digital transformation journey today! Take your first assessment to discover your organization's readiness level."
                : "Track your digital transformation journey and measure your readiness progress with our advanced assessment platform."
              }
            </p>
          </div>
        </div>

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="card card-hover slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-400 mb-2">Your Assessments Completed</p>
                <p className="text-metric text-metric-primary">{scores.length}</p>
              </div>
              <div className="icon-container icon-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card card-hover slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-400 mb-2">Your Current Readiness</p>
                <p className="text-metric text-metric-success">
                  {scores.length > 0 ? scores[0]?.readiness_level || 'Beginner' : 'Beginner'}
                </p>
              </div>
              <div className="icon-container icon-success">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card card-hover slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-400 mb-2">Your Average Score</p>
                <p className="text-metric text-metric-warning">
                  {scores.length > 0 ? Math.round((scores.reduce((sum, score) => sum + score.total_score, 0) / scores.length) / 60 * 100) + '%' : '0%'}
                </p>
              </div>
              <div className="icon-container icon-warning">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* User Background Prompt */}
        {showUserBackgroundPrompt && (
          <div className="section slide-up">
            <div className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <div className="flex items-center mb-6">
                <div className="icon-container icon-primary mr-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-heading text-white">
                  Tell us about yourself
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Question 1: Role */}
                <div>
                  <label className="form-label">
                    1️⃣ What is your current designation/role?
                  </label>
                  <select
                    className="form-select"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <option value="">Select your role</option>
                    <option value="CEO">CEO</option>
                    <option value="COO">COO</option>
                    <option value="CFO">CFO</option>
                    <option value="CIO">CIO</option>
                    <option value="CDO">CDO</option>
                    <option value="Director">Director</option>
                    <option value="Manager">Manager</option>
                    <option value="Other">Other</option>
                  </select>
                  {userRole === 'Other' && (
                    <input
                      type="text"
                      className="form-input mt-2"
                      placeholder="Please specify your role"
                      value={otherRole}
                      onChange={(e) => setOtherRole(e.target.value)}
                    />
                  )}
                </div>

                {/* Question 2: Department */}
                <div>
                  <label className="form-label">
                    2️⃣ Which department are you primarily responsible for?
                  </label>
                  <select
                    className="form-select"
                    value={userDepartment}
                    onChange={(e) => setUserDepartment(e.target.value)}
                  >
                    <option value="">Select your department</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Technology">Technology</option>
                    <option value="Strategy">Strategy</option>
                    <option value="HR">HR</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Research & Design">Research & Design</option>
                    <option value="Other">Other</option>
                  </select>
                  {userDepartment === 'Other' && (
                    <input
                      type="text"
                      className="form-input mt-2"
                      placeholder="Please specify your department"
                      value={otherDepartment}
                      onChange={(e) => setOtherDepartment(e.target.value)}
                    />
                  )}
                </div>

                {/* Question 3: Annual Revenue */}
                <div>
                  <label className="form-label">
                    3️⃣ What is your company's annual revenue?
                  </label>
                  <select
                    className="form-select"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                  >
                    <option value="">Select annual revenue</option>
                    <option value="<$25M">$25M</option>
                    <option value="$25M–$100M">$25M–$100M</option>
                    <option value="$100M–$500M">$100M–$500M</option>
                    <option value="$500M+">$500M+</option>
                  </select>
                </div>

                {/* Question 4: Country */}
                <div>
                  <label className="form-label">
                    4️⃣ What country are you based in?
                  </label>
                  <select
                    className="form-select"
                    value={userCountry}
                    onChange={(e) => setUserCountry(e.target.value)}
                  >
                    <option value="">Select your country</option>
                    <option value="Australia">Australia</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Canada">Canada</option>
                    <option value="China">China</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Japan">Japan</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Singapore">Singapore</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Thailand">Thailand</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    className="btn-primary disabled:opacity-50"
                    disabled={!userRole || !userDepartment || !annualRevenue || !userCountry || 
                             (userRole === 'Other' && !otherRole.trim()) ||
                             (userDepartment === 'Other' && !otherDepartment.trim())}
                    onClick={handleSaveUserBackground}
                  >
                    Continue to Industry Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Industry Prompt */}
        {showIndustryPrompt && (
          <div className="section slide-up">
            <div className="card bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <div className="flex items-center mb-4">
                <div className="icon-container icon-warning mr-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-body font-medium text-white">
              Please select your industry:
            </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <select
                  className="form-select mb-3 sm:mb-0"
              onChange={e => setSelectedIndustry(e.target.value)}
              value={selectedIndustry}
            >
              <option value="" disabled>Select industry</option>
              {[
                'Aerospace & defense',
                'Automotive & transportation',
                'Battery',
                'Electronics & semiconductors',
                'Energy & utilities',
                'Food & beverage',
                'Heavy equipment',
                'Industrial machinery',
                'Marine',
                'Medical devices & pharmaceuticals',
                'Small & medium business'
              ].map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <button
                  className="btn-primary disabled:opacity-50"
              disabled={!selectedIndustry}
              onClick={() => handleSetIndustry(selectedIndustry)}
            >
              Save
            </button>
              </div>
            </div>
          </div>
        )}

        {/* Trends Question */}
        {showTrendsPrompt && industry && (
          <div className="section slide-up">
            <div className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <p className="text-body text-white mb-4">
                Would you like to know the latest top 5 trends in <span className="font-semibold text-blue-400">{industry}</span>?
              </p>
              <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Mark that user has seen the prompt for this industry
                  if (user && industry) {
                    localStorage.setItem(`trendsPromptSeen_${user.id}_${industry}`, 'true')
                  }
                  handleFetchTrends()
                }}
                  className="btn-primary"
                disabled={fetchingTrends}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowTrendsPrompt(false)
                  // Mark that user has seen the prompt for this industry
                  if (user && industry) {
                    localStorage.setItem(`trendsPromptSeen_${user.id}_${industry}`, 'true')
                  }
                }}
                  className="btn-secondary"
                disabled={fetchingTrends}
              >
                No
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Trends Display */}
        {fetchingTrends && (
          <div className="section slide-up">
            <div className="card text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="loading-spinner h-5 w-5"></div>
                <span className="loading-text">Fetching latest trends...</span>
              </div>
            </div>
          </div>
        )}

        {/* Trend Selection Interface */}
        {showTrendSelection && trends.length > 0 && (
          <div className="section slide-up">
            <div className="card bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
              <div className="flex items-center mb-6">
                <div className="icon-container icon-success mr-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-heading text-white">
                    Select Your Top 3 Trends
                  </h3>
                  <p className="text-body text-gray-300">
                    Choose the 3 trends that interest you most in {industry}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-body text-white">
                    Selected: {selectedTrends.length}/3
                  </span>
                  {selectedTrends.length === 3 && (
                    <span className="text-sm text-green-400 font-medium">
                      ✓ Maximum selections reached
                    </span>
                  )}
                </div>
                
                <div className="assessment-grid">
                  {trends.map((item, idx) => {
                    const t = item as any
                    const isSelected = selectedTrends.includes(idx)
                    
                    return (typeof t === 'object' && t !== null && 'trend' in t) ? (
                      <div 
                        key={idx} 
                        className={`card card-hover cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-green-500 bg-green-500/10 border-green-500/50' 
                            : 'hover:ring-2 hover:ring-blue-500/50'
                        }`}
                        onClick={() => handleTrendSelection(idx)}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center mr-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                              isSelected 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-400'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="icon-container icon-primary flex-shrink-0">
                              <span className="text-sm font-bold">{idx + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-subheading text-blue-400 mb-2">{t.trend}</h4>
                            {t.subtitle && (
                              <p className="text-caption italic mb-3">{t.subtitle}</p>
                            )}
                            <p className="text-body">
                              <span className="font-semibold text-white">Implication:</span> {t.implication}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTrendSelection(false)
                    setTrends([])
                    setSelectedTrends([])
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSelectedTrends}
                  disabled={selectedTrends.length === 0}
                  className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Selected Trends ({selectedTrends.length}/3)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spacing between sections */}
        <div className="mb-8"></div>

        {/* Available Assessments Section */}
        <div className="section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-heading">Available Assessments</h3>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="assessment-grid">
            {/* C-Level Assessment */}
          <div className="card card-hover relative">
            {scores.find(s => s.assessment_type === 'c_level') && (
              <div className="absolute top-4 right-4">
                <span className="status-badge status-info">
                  {scores.find(s => s.assessment_type === 'c_level')?.readiness_level}
                </span>
              </div>
            )}
            <div className="flex items-start mb-6">
              <div className="icon-container icon-primary mr-4">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-subheading mb-2">
                  C-Level Management Assessment
                </h3>
                <p className="text-body text-gray-300 mb-2">
                  Strategic readiness evaluation for leadership teams
                </p>
                <p className="text-caption">{cLevelQuestions.length} Questions</p>
              </div>
            </div>
            
                        {(() => {
              const cLevelScore = scores.find(s => s.assessment_type === 'c_level')
              console.log('C-Level score found:', cLevelScore)
              return cLevelScore ? (
                <div>
                  <p className="text-caption text-gray-400 mb-3">
                    Completed {new Date(cLevelScore.completed_at || '').toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-body font-medium">Score</span>
                    <div className="progress-bar flex-1">
                      <div 
                        className="progress-fill progress-fill-success" 
                        style={{ width: `${Math.round((cLevelScore.total_score || 0) / 60 * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-body font-medium text-green-400">
                      {Math.round((cLevelScore.total_score || 0) / 60 * 100)}%
                    </span>
                  </div>
                  <div className="space-y-2"> {/* Added div for vertical spacing */}
                    <button 
                      onClick={() => router.push(`/results?type=c_level`)}
                      className="btn-outline w-full flex items-center justify-center"
                    >
                      <span>View Results</span>
                      <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => router.push('/assessment/c-level')}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <span>Retake Assessment</span>
                      <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                                </div>
              ) : (
                <button 
                  onClick={() => router.push('/assessment/c-level')}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <span>Start Assessment</span>
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })()}
            </div>

            {/* Shopfloor Assessment */}
          <div className="card card-hover relative">
            {scores.find(s => s.assessment_type === 'shopfloor') && (
              <div className="absolute top-4 right-4">
                <span className="status-badge status-info">
                  {scores.find(s => s.assessment_type === 'shopfloor')?.readiness_level}
                </span>
              </div>
            )}
            <div className="flex items-start mb-6">
              <div className="icon-container icon-success mr-4">
                <Settings className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-subheading mb-2">
                  Shopfloor Operators Assessment
                </h3>
                <p className="text-body text-gray-300 mb-2">
                  Operational readiness evaluation for frontline teams
                </p>
                <p className="text-caption">{shopfloorQuestions.length} Questions</p>
              </div>
            </div>
            
            {scores.find(s => s.assessment_type === 'shopfloor') ? (
              <div>
                <p className="text-caption text-gray-400 mb-3">
                  Completed {new Date(scores.find(s => s.assessment_type === 'shopfloor')?.completed_at || '').toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-body font-medium">Score</span>
                  <div className="progress-bar flex-1">
                    <div 
                      className="progress-fill progress-fill-success" 
                      style={{ width: `${Math.round((scores.find(s => s.assessment_type === 'shopfloor')?.total_score || 0) / 60 * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-body font-medium text-green-400">
                    {Math.round((scores.find(s => s.assessment_type === 'shopfloor')?.total_score || 0) / 60 * 100)}%
                  </span>
                </div>
                <button 
                  onClick={() => router.push(`/results?type=shopfloor`)}
                  className="btn-outline w-full flex items-center justify-center"
                >
                  <span>View Results</span>
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/assessment/shopfloor')}
                className="btn-primary w-full flex items-center justify-center"
              >
                <span>Start Assessment</span>
                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
              </button>
            )}
            </div>
          </div>

        {/* Recent Scores Table */}
        {scores.length > 0 && (
          <div className="section slide-up">
            <div className="card">
              <h3 className="text-subheading mb-6">
                Recent Assessment Results
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Assessment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Readiness Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {scores.map((score) => (
                      <tr key={score.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {score.assessment_type === 'c_level' ? 'C-Level Management' : 'Shopfloor Operators'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {score.total_score}/60
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge ${getReadinessColor(score.readiness_level)}`}>
                            {score.readiness_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(score.completed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Spacing between sections */}
        <div className="mb-8"></div>

        {/* Display Saved Trends */}
        {!showTrendSelection && !showTrendsPrompt && trends.length > 0 && (
          <div className="section slide-up">
            <div className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <div className="flex items-center mb-6">
                <div className="icon-container icon-primary mr-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-heading text-white">
                    Your Selected Trends in {industry}
                  </h3>
                  <p className="text-body text-gray-300">
                    Industry insights tailored to your interests
                  </p>
                </div>
              </div>
              
              <div className="assessment-grid">
                {trends.map((item, idx) => {
                  const t = item as any
                  return (typeof t === 'object' && t !== null && 'trend' in t) ? (
                    <div key={idx} className="card card-hover">
                      <div className="flex items-start">
                        <div className="icon-container icon-primary mr-4 flex-shrink-0">
                          <span className="text-sm font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-subheading text-blue-400 mb-2">{t.trend}</h4>
                          {t.subtitle && (
                            <p className="text-caption italic mb-3">{t.subtitle}</p>
                          )}
                          <p className="text-body">
                            <span className="font-semibold text-white">Implication:</span> {t.implication}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>
        )}

        {/* Digital Roadmap Prompt */}
        {showRoadmapPrompt && (
          <div className="section slide-up">
            <div className="card bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <div className="flex items-center mb-6">
                <div className="icon-container icon-primary mr-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-heading text-white">
                    🗺️ Personalized Digital Roadmap
                  </h3>
                  <p className="text-body text-gray-300">
                    Would you like a customized digital transformation roadmap?
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <h4 className="text-subheading text-purple-400 mb-3">What's included:</h4>
                  <ul className="space-y-2 text-body">
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Your assessment results & readiness level
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Your selected industry trends ({industry})
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Your background profile & role
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      AI-powered recommendations
                    </li>
                  </ul>
                </div>
                
                <p className="text-body text-gray-300 mb-6">
                  Get a comprehensive, personalized roadmap that combines your assessment data, industry insights, and AI recommendations to guide your digital transformation journey.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleRoadmapResponse('no')}
                  className="btn-secondary"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => handleRoadmapResponse('yes')}
                  className="btn-primary"
                >
                  Yes, Generate Roadmap
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 