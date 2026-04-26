'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw, UserPlus, KeyRound } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

type Mode = 'login' | 'set_password' | 'forgot'

export default function SubPortalLanding() {
  const router = useRouter()
  const [mode, setMode]           = useState<Mode>('login')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [message, setMessage]     = useState<string | null>(null)

  // On mount: check for existing session or invite token in URL
  useEffect(() => {
    const supabase = getClient()

    const init = async () => {
      // Supabase auto-handles invite/recovery tokens from the URL hash
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: { user } } = await supabase.auth.getUser()
        // If this is a fresh invite (no password set yet), prompt them to set one
        const isInvite = window.location.hash.includes('type=invite')
        if (isInvite) {
          setMode('set_password')
          setEmail(user?.email ?? '')
          setLoading(false)
          return
        }
        // Existing session — find their sub record and redirect
        await redirectToDashboard(supabase, user?.email ?? '')
        return
      }
      setLoading(false)
    }

    // Listen for auth state changes (handles invite token redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        if (session) {
          const isInvite = window.location.hash.includes('type=invite')
          if (isInvite && mode !== 'set_password') {
            setMode('set_password')
            setEmail(session.user.email ?? '')
            setLoading(false)
            return
          }
          await redirectToDashboard(supabase, session.user.email ?? '')
        }
      }
    })

    init()
    return () => subscription.unsubscribe()
  }, [])

  const redirectToDashboard = async (supabase: ReturnType<typeof getClient>, email: string) => {
    try {
      const res  = await fetch('/api/subs')
      const json = await res.json()
      const subs = Array.isArray(json) ? json : (json.data ?? [])
      const sub  = subs.find((s: any) => s.email?.toLowerCase() === email.toLowerCase())
      if (sub) {
        router.push(`/sub-portal/${sub.id}`)
      } else {
        setError('No approved subcontractor account found for this email. Contact Capstone if you believe this is an error.')
        await supabase.auth.signOut()
        setLoading(false)
      }
    } catch {
      setError('Unable to load your account. Please try again.')
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const supabase = getClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      // redirectToDashboard fires via onAuthStateChange
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials'
        ? 'Incorrect email or password. If you haven\'t set a password yet, check your invite email.'
        : err.message)
      setSubmitting(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const supabase = getClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      const { data: { user } } = await supabase.auth.getUser()
      await redirectToDashboard(supabase, user?.email ?? email)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const supabase = getClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sub-portal`,
      })
      if (resetError) throw resetError
      setMessage('Password reset link sent. Check your email.')
    } catch (err: any) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <RefreshCw size={24} className="text-[#c8922a] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capstone" className="h-20 w-auto mx-auto mb-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">SUB PORTAL</h1>
        <p className="font-nav text-sm text-[#606070] mt-1 tracking-wide">CAPSTONE GENERAL CONTRACTING</p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-6 shadow-2xl">

          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c8922a] to-[#e8aa40] flex items-center justify-center flex-shrink-0">
              {mode === 'set_password' ? <KeyRound size={15} className="text-[#09090b]" /> : <HardHat size={15} className="text-[#09090b]" />}
            </div>
            <div>
              <p className="font-display text-base tracking-wider text-[#e8e8ee]">
                {mode === 'login' ? 'SIGN IN' : mode === 'set_password' ? 'SET YOUR PASSWORD' : 'RESET PASSWORD'}
              </p>
              <p className="font-nav text-[11px] text-[#606070]">
                {mode === 'login' ? 'Access your subcontractor dashboard' : mode === 'set_password' ? 'Choose a password for future logins' : 'Enter your email to receive a reset link'}
              </p>
            </div>
          </div>

          {/* Login form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg pl-9 pr-4 py-3 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
              </div>
              <div>
                <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg pl-9 pr-10 py-3 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606070] hover:text-[#e8e8ee]">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && <div className="px-3 py-2 bg-[#b83232]/10 border border-[#b83232]/30 rounded-md"><p className="font-body text-xs text-[#b83232]">{error}</p></div>}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-lg font-display text-base tracking-wider transition-colors disabled:opacity-60">
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : <><HardHat size={16} />SIGN IN</>}
              </button>

              <button type="button" onClick={() => { setMode('forgot'); setError(null) }}
                className="w-full text-center font-nav text-xs text-[#606070] hover:text-[#c8922a] transition-colors pt-1">
                Forgot your password?
              </button>
            </form>
          )}

          {/* Set password form (after invite) */}
          {mode === 'set_password' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="px-3 py-2 bg-[#c8922a]/10 border border-[#c8922a]/30 rounded-md">
                <p className="font-body text-xs text-[#e8aa40]">Welcome! Set a password to access your dashboard anytime. Signed in as <strong>{email}</strong>.</p>
              </div>
              <div>
                <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg pl-9 pr-10 py-3 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606070] hover:text-[#e8e8ee]">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
                  <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" required
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg pl-9 pr-4 py-3 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
              </div>

              {error && <div className="px-3 py-2 bg-[#b83232]/10 border border-[#b83232]/30 rounded-md"><p className="font-body text-xs text-[#b83232]">{error}</p></div>}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-lg font-display text-base tracking-wider transition-colors disabled:opacity-60">
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : 'SET PASSWORD & CONTINUE'}
              </button>
            </form>
          )}

          {/* Forgot password form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg pl-9 pr-4 py-3 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
              </div>

              {error   && <div className="px-3 py-2 bg-[#b83232]/10 border border-[#b83232]/30 rounded-md"><p className="font-body text-xs text-[#b83232]">{error}</p></div>}
              {message && <div className="px-3 py-2 bg-[#3eb85a]/10 border border-[#3eb85a]/30 rounded-md"><p className="font-body text-xs text-[#3eb85a]">{message}</p></div>}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-lg font-display text-base tracking-wider transition-colors disabled:opacity-60">
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : 'SEND RESET LINK'}
              </button>

              <button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null) }}
                className="w-full text-center font-nav text-xs text-[#606070] hover:text-[#c8922a] transition-colors">
                ← Back to sign in
              </button>
            </form>
          )}

          {/* Register link */}
          {mode === 'login' && (
            <div className="mt-5 pt-5 border-t border-[#2a2a32] text-center">
              <p className="font-nav text-xs text-[#606070] mb-2">Not yet a Capstone sub?</p>
              <a href="/sub-portal/register"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#151518] border border-[#2a2a32] hover:border-[#c8922a]/40 rounded-lg font-nav text-sm text-[#9090a0] hover:text-[#e8e8ee] transition-colors">
                <UserPlus size={14} />Apply to Join<ArrowRight size={13} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
