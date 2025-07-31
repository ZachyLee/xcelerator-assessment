import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lhvuahsyrrafcdvuzorp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 0

// Create a mock client if no valid credentials are provided
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({ single: () => ({ data: null, error: null }) }),
          data: [],
          error: null
        }),
        insert: () => ({ data: [{ id: 'mock-id' }], error: null }),
        update: () => ({ 
          eq: () => ({ data: [{ id: 'mock-id' }], error: null }),
          data: [{ id: 'mock-id' }], 
          error: null 
        }),
        upsert: () => ({ data: [{ id: 'mock-id' }], error: null }),
        delete: () => ({ 
          eq: () => ({ data: [{ id: 'mock-id' }], error: null }),
          data: [{ id: 'mock-id' }], 
          error: null 
        }),
        limit: () => ({
          data: [],
          error: null
        }),
        eq: () => ({ 
          single: () => ({ data: null, error: null }),
          data: null, 
          error: null 
        }),
        single: () => ({ data: null, error: null }),
      }),
    } as any

// Database types
export interface AssessmentResponse {
  id?: string
  user_id: string
  assessment_type: 'c_level' | 'shopfloor'
  question_id: number
  answer: number
  created_at?: string
}

export interface AssessmentScore {
  id?: string
  user_id: string
  assessment_type: 'c_level' | 'shopfloor'
  total_score: number
  readiness_level: 'Beginner' | 'Developing' | 'Advanced' | 'Leader'
  completed_at: string
  created_at?: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface IndustryTrend {
  trend: string
  implication: string
}

export interface IndustryTrendRecord {
  id?: string
  user_id: string
  industry: string
  trends: IndustryTrend[]
  created_at?: string
}

export interface UserProfile {
  id: string
  industry?: string
  user_role?: string
  user_department?: string
  annual_revenue?: string
  c_level_assessment_answers?: Record<string, number>
  c_level_total_score?: number
  c_level_readiness_level?: string
  c_level_completed_at?: string
  shopfloor_assessment_answers?: Record<string, number>
  shopfloor_total_score?: number
  shopfloor_readiness_level?: string
  shopfloor_completed_at?: string
  created_at?: string
  updated_at?: string
} 