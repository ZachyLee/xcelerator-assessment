'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  designation: Array<{ role: string; count: number }>
  industry: Array<{ name: string; count: number }>
  revenue: Array<{ range: string; count: number }>
  country: Array<{ name: string; count: number }>
}

interface AnalyticsChartsProps {
  data?: AnalyticsData // Make data optional since we'll fetch it
}

export default function AnalyticsCharts({ data: propData }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<'designation' | 'industry' | 'revenue' | 'country'>('designation')
  const [data, setData] = useState<AnalyticsData>({
    designation: [],
    industry: [],
    revenue: [],
    country: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        // Fetching analytics data
        const response = await fetch('/api/analytics')
        
        // Response status checked
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        
        const analyticsData = await response.json()
        // Received analytics data
        setData(analyticsData)
        setError(null)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Failed to load analytics data')
        // Fallback to empty data
        setData({
          designation: [],
          industry: [],
          revenue: [],
          country: []
        })
      } finally {
        setLoading(false)
      }
    }

    // If no prop data provided, fetch from API
    if (!propData) {
      fetchAnalytics()
    } else {
      setData(propData)
      setLoading(false)
    }
  }, [propData])

  const tabs = [
    { key: 'designation', label: 'Designation', icon: '👥' },
    { key: 'industry', label: 'Industry', icon: '🏭' },
    { key: 'revenue', label: 'Revenue', icon: '💰' },
    { key: 'country', label: 'Country', icon: '🌍' }
  ] as const

  const getChartData = () => {
    switch (activeTab) {
      case 'designation':
        return data.designation
      case 'industry':
        return data.industry
      case 'revenue':
        return data.revenue
      case 'country':
        return data.country
      default:
        return data.designation
    }
  }

  const getChartTitle = () => {
    switch (activeTab) {
      case 'designation':
        return 'Assessment Completion by Designation'
      case 'industry':
        return 'Assessment Completion by Industry'
      case 'revenue':
        return 'Assessment Completion by Revenue Size'
      case 'country':
        return 'Assessment Completion by Country'
      default:
        return 'Assessment Analytics'
    }
  }

  const getDataKey = () => {
    switch (activeTab) {
      case 'designation':
        return 'role'
      case 'industry':
        return 'name'
      case 'revenue':
        return 'range'
      case 'country':
        return 'name'
      default:
        return 'role'
    }
  }

  const chartData = getChartData()
  const dataKey = getDataKey()
  const total = chartData.reduce((sum, item) => sum + item.count, 0)

  // Chart data loaded

  if (loading) {
    return (
      <div className="section slide-up">
        <div className="card bg-gray-900/30 backdrop-blur-lg border border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section slide-up">
        <div className="card bg-gray-900/30 backdrop-blur-lg border border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-2">⚠️ {error}</p>
              <p className="text-gray-400 text-sm">Analytics data unavailable</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="section slide-up">
        <div className="card bg-gray-900/30 backdrop-blur-lg border border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-400 mb-2">📊</p>
              <p className="text-gray-400">No analytics data available yet</p>
              <p className="text-gray-500 text-sm">Complete assessments to see insights</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section slide-up">
      <div className="card bg-gray-900/30 backdrop-blur-lg border border-gray-700/50 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-heading text-white">Overall Xcelerator Assessment Analytics</h3>
          <div className="text-caption text-gray-400">
            Real-time insights from all users
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Chart Container */}
        <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
          <h4 className="text-subheading text-white mb-4 text-center">
            {getChartTitle()}
          </h4>

          {/* Bar Chart Visualization */}
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage: number = total > 0 ? (item.count / total) * 100 : 0
              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      {String(item[dataKey as keyof typeof item])}
                    </span>
                    <span className="text-sm text-gray-400">
                      {item.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(percentage)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 