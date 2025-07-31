import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

console.log('Analytics API - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
console.log('Analytics API - Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called - fetching profiles...')
    
    // Fetch all profiles with assessment data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_role, user_department, industry, annual_revenue, user_country, c_level_total_score, shopfloor_total_score')
      .not('user_role', 'is', null) // Only include users who have completed their profile

    console.log('Profiles fetched:', profiles?.length || 0, 'profiles')
    console.log('Sample profile data:', profiles?.[0])
    console.log('All profiles user_roles:', profiles?.map(p => p.user_role))
    console.log('All profiles industries:', profiles?.map(p => p.industry))

    if (error) {
      console.error('Error fetching analytics data:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Process the data to create analytics
    const analytics = {
      designation: [] as Array<{ role: string; count: number }>,
      industry: [] as Array<{ name: string; count: number }>,
      revenue: [] as Array<{ range: string; count: number }>,
      country: [] as Array<{ name: string; count: number }>
    }

    // Count designations (user_role)
    const designationCounts: { [key: string]: number } = {}
    profiles?.forEach(profile => {
      if (profile.user_role) {
        designationCounts[profile.user_role] = (designationCounts[profile.user_role] || 0) + 1
      }
    })

    // Count industries
    const industryCounts: { [key: string]: number } = {}
    profiles?.forEach(profile => {
      if (profile.industry) {
        industryCounts[profile.industry] = (industryCounts[profile.industry] || 0) + 1
      }
    })

    // Count revenue ranges
    const revenueCounts: { [key: string]: number } = {}
    profiles?.forEach(profile => {
      if (profile.annual_revenue) {
        revenueCounts[profile.annual_revenue] = (revenueCounts[profile.annual_revenue] || 0) + 1
      }
    })

    // Count countries
    const countryCounts: { [key: string]: number } = {}
    profiles?.forEach(profile => {
      if (profile.user_country) {
        countryCounts[profile.user_country] = (countryCounts[profile.user_country] || 0) + 1
      }
    })

    // Convert to arrays and sort by count
    analytics.designation = Object.entries(designationCounts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)

    analytics.industry = Object.entries(industryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    analytics.revenue = Object.entries(revenueCounts)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => b.count - a.count)

    analytics.country = Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    console.log('Analytics processed:')
    console.log('Designation counts:', designationCounts)
    console.log('Industry counts:', industryCounts)
    console.log('Revenue counts:', revenueCounts)
    console.log('Country counts:', countryCounts)
    console.log('Final analytics:', analytics)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 