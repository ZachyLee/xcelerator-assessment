'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/AuthForm'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
    // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Session check error:', error)
          // Don't try to sign out if we're using mock client
          setUser(null)
          setLoading(false)
          return
        }

      setUser(session?.user ?? null)
      setLoading(false)
      } catch (error) {
        console.warn('Error checking session:', error)
        // Don't try to sign out if we're using mock client
        setUser(null)
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
    await supabase.auth.signOut()
    setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      // Force clear user state even if signOut fails
      setUser(null)
    }
  }

  const handleAuthSuccess = () => {
    // Auth success is handled by the onAuthStateChange listener
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return <Dashboard onSignOut={handleSignOut} />
}
