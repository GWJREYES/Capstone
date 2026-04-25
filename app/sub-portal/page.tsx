'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, HardHat, UserPlus } from 'lucide-react'

export default function SubPortalLanding() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/subs?email=${encodeURIComponent(email.trim())}`)
      const data = await res.json()
      const sub  = Array.isArray(data) ? data.find((s: any) => s.email?.toLowerCase() === email.trim().toLowerCase()) : null
      if (sub) {
        router.push(`/sub-portal/${sub.id}`)
      } else {
        setError('No account found for that email. If you haven\'t applied yet, register below.')
      }
    } catch {
      setError('Unable to look up your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
      {/* Logo / brand */}
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capstone General Contracting" className="h-20 w-auto mx-auto mb-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">SUB PORTAL</h1>
        <p className="font-nav text-sm text-[#606070] mt-1 tracking-wide">CAPSTONE GENERAL CONTRACTING</p>
      </div>

      {/* Lookup card */}
      <div className="w-full max-w-md">
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#c8922a] to-[#e8aa40] flex items-center justify-center">
              <HardHat size={15} className="text-[#09090b]" />
            </div>
            <div>
              <p className="font-display text-base tracking-wider text-[#e8e8ee]">ACCESS YOUR DASHBOARD</p>
              <p className="font-nav text-[11px] text-[#606070]">Enter the email address on your account</p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="space-y-3">
            <div>
              <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg px-4 py-3 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold"
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-[#b83232]/10 border border-[#b83232]/30 rounded-md">
                <p className="font-body text-xs text-[#b83232]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-lg font-display text-lg tracking-wider transition-colors disabled:opacity-60"
            >
              {loading ? (
                <span className="font-nav text-sm">Looking up…</span>
              ) : (
                <>
                  <Search size={16} />
                  ACCESS PORTAL
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#2a2a32] text-center">
            <p className="font-nav text-xs text-[#606070] mb-2">Not yet registered?</p>
            <a
              href="/sub-portal/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#151518] border border-[#2a2a32] hover:border-[#c8922a]/40 rounded-lg font-nav text-sm text-[#9090a0] hover:text-[#e8e8ee] transition-colors"
            >
              <UserPlus size={14} />
              Apply to Work with Capstone
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
