'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3 } from 'lucide-react'

interface AuthFormProps {
  onAuthSuccess: () => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Use dynamic site URL from environment variables
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        
        console.log('AuthForm - Site URL:', siteUrl, 'Environment:', process.env.NODE_ENV)
        
        // Use dynamic redirect to dashboard
        const redirectTo = `${siteUrl}/auth/callback?redirect=${encodeURIComponent(`${siteUrl}/dashboard`)}`
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo
          }
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link! After confirming, you\'ll be redirected to the dashboard.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onAuthSuccess()
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 fade-in">
          <div className="icon-container icon-primary mx-auto mb-4">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h1 className="text-display mb-2">
            Xcelerator Insights
          </h1>
          <p className="text-body text-gray-300">
            Digital Transformation Readiness Portal
          </p>
        </div>
        
        {/* Auth Card */}
        <div className="card card-hover slide-up">
          <div className="text-center mb-6">
            <h2 className="text-heading mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-body text-gray-300">
              {isSignUp 
                ? 'Start your digital transformation journey today'
                : 'Sign in to continue your assessment'
              }
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{message}</p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Your email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 slide-up">
          <div className="card text-center">
            <div className="icon-container icon-success mx-auto mb-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">AI-Powered</h3>
            <p className="text-xs text-gray-400">Advanced analytics and insights</p>
          </div>
          
          <div className="card text-center">
            <div className="icon-container icon-primary mx-auto mb-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Real-time</h3>
            <p className="text-xs text-gray-400">Instant results and feedback</p>
          </div>
          
          <div className="card text-center">
            <div className="icon-container icon-purple mx-auto mb-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Secure</h3>
            <p className="text-xs text-gray-400">Enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>
  )
} 