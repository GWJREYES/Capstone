'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HardHat, Briefcase, RefreshCw, Radio, AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { Subcontractor, Job, SubStatus } from '@/types'
import StatusPill from '@/components/ui/StatusPill'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const STATUS_OPTIONS: { value: SubStatus; label: string; color: string }[] = [
  { value: 'available',   label: 'Available',   color: 'text-[#3eb85a]' },
  { value: 'busy',        label: 'Busy',         color: 'text-[#d4880a]' },
  { value: 'unavailable', label: 'Unavailable',  color: 'text-[#606070]' },
]

const DAY_COLORS: Record<string, string> = {
  available:   'bg-[#3eb85a]/20 text-[#3eb85a] border-[#3eb85a]/40',
  busy:        'bg-[#d4880a]/20 text-[#d4880a] border-[#d4880a]/40',
  unavailable: 'bg-[#3a3a48]/40 text-[#606070] border-[#3a3a48]',
}

function toMonthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
function toDateStr(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }

export default function SubPortalDashboard() {
  const { subId } = useParams<{ subId: string }>()
  const router = useRouter()
  const [sub, setSub]             = useState<Subcontractor | null>(null)
  const [jobs, setJobs]           = useState<Job[]>([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(false)
  const [notFound, setNotFound]   = useState(false)
  const [authError, setAuthError] = useState(false)

  // Calendar state
  const today = new Date()
  const [current, setCurrent]           = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [availability, setAvailability] = useState<Record<string, string>>({})
  const [calLoading, setCalLoading]     = useState(false)
  const [saving, setSaving]             = useState<string | null>(null)

  const year       = current.getFullYear()
  const month      = current.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow   = new Date(year, month, 1).getDay()
  const monthKey   = toMonthKey(current)

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/sub-portal')
        return
      }

      try {
        const [subsRes, jobsRes] = await Promise.all([fetch('/api/subs'), fetch('/api/jobs')])
        const subsJson = await subsRes.json()
        const allJobs  = await jobsRes.json()
        const subs     = Array.isArray(subsJson) ? subsJson : (subsJson.data ?? [])
        const found    = subs.find((s: any) => s.id === subId)

        if (!found) { setNotFound(true); setLoading(false); return }

        // Verify the logged-in user owns this sub record
        if (found.email?.toLowerCase() !== session.user.email?.toLowerCase()) {
          setAuthError(true); setLoading(false); return
        }

        setSub(found)
        const jobsArr = Array.isArray(allJobs) ? allJobs : (allJobs.data ?? [])
        const assigned = jobsArr.filter((j: any) => j.subcontractor_id === subId || j.subcontractor?.id === subId)
        setJobs(assigned)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [subId, router])

  const loadAvailability = useCallback(async () => {
    setCalLoading(true)
    try {
      const res  = await fetch(`/api/sub-availability?sub_id=${subId}&month=${monthKey}`)
      const data = await res.json()
      const map: Record<string, string> = {}
      if (Array.isArray(data)) data.forEach((e: any) => { map[e.date] = e.status })
      setAvailability(map)
    } catch {}
    setCalLoading(false)
  }, [subId, monthKey])

  useEffect(() => { if (sub) loadAvailability() }, [sub, loadAvailability])

  const handleLogout = async () => {
    await getSupabase().auth.signOut()
    router.push('/sub-portal')
  }

  const handleStatusChange = async (status: SubStatus) => {
    if (!sub) return
    setUpdating(true)
    try {
      await fetch(`/api/subs/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setSub((s) => s ? { ...s, status } : s)
    } catch {}
    setUpdating(false)
  }

  const handleDayClick = async (day: number) => {
    const dateStr = toDateStr(year, month, day)
    const cur = availability[dateStr]
    const cycle: (SubStatus | null)[] = ['available', 'busy', 'unavailable', null]
    const next = cycle[(cycle.indexOf((cur as SubStatus) ?? null) + 1) % cycle.length]
    setSaving(dateStr)
    try {
      if (next === null) {
        setAvailability((prev) => { const n = { ...prev }; delete n[dateStr]; return n })
        await fetch('/api/sub-availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub_id: subId, date: dateStr, status: 'available' }) })
        setAvailability((prev) => { const n = { ...prev }; delete n[dateStr]; return n })
      } else {
        setAvailability((prev) => ({ ...prev, [dateStr]: next }))
        await fetch('/api/sub-availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub_id: subId, date: dateStr, status: next }) })
      }
    } catch {}
    setSaving(null)
  }

  const activeJobs = jobs.filter((j) => ['scheduled','in_progress','sold'].includes(j.status))
  const pastJobs   = jobs.filter((j) => ['complete','cancelled'].includes(j.status))
  const monthName  = current.toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><RefreshCw size={24} className="text-[#c8922a] animate-spin" /></div>

  if (authError) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle size={36} className="text-[#b83232] mb-3" />
      <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">ACCESS DENIED</h2>
      <p className="font-body text-sm text-[#606070] mt-2">You do not have access to this account.</p>
      <button onClick={handleLogout} className="mt-4 font-nav text-sm text-[#c8922a] hover:text-[#e8aa40]">Sign out and try again →</button>
    </div>
  )

  if (notFound || !sub) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle size={36} className="text-[#b83232] mb-3" />
      <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">ACCOUNT NOT FOUND</h2>
      <p className="font-body text-sm text-[#606070] mt-2">This portal link is invalid or your account is pending approval.</p>
      <a href="/sub-portal" className="mt-4 font-nav text-sm text-[#c8922a] hover:text-[#e8aa40]">← Back to Portal</a>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Portal header */}
      <div className="bg-[#0c1221] border-b border-[#1a2844] px-4 py-3 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capstone" className="h-10 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-body text-sm font-semibold text-[#e8e8ee]">{sub.company}</p>
            <p className="font-nav text-xs text-[#606070] capitalize">{sub.trade}</p>
          </div>
          <button onClick={handleLogout} title="Sign out" className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#1a1a24] transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* General status */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Radio size={14} className="text-[#c8922a]" />
            <span className="font-display text-sm tracking-wider text-[#9090a0]">YOUR AVAILABILITY</span>
            {updating && <RefreshCw size={12} className="text-[#606070] animate-spin ml-auto" />}
          </div>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleStatusChange(opt.value)} disabled={updating}
                className={`flex-1 py-2.5 rounded-lg border font-nav text-xs font-semibold tracking-wider transition-all ${
                  sub.status === opt.value
                    ? `${opt.color} border-current bg-current/10`
                    : 'text-[#606070] border-[#2a2a32] bg-[#0f0f12] hover:border-[#606070]'
                }`}>
                {opt.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Availability calendar */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-[#c8922a]" />
              <span className="font-display text-sm tracking-wider text-[#9090a0]">AVAILABILITY</span>
              {calLoading && <RefreshCw size={11} className="text-[#606070] animate-spin" />}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-[#2a2a32] text-[#606070]"><ChevronLeft size={14} /></button>
              <span className="font-nav text-xs text-[#e8e8ee] w-32 text-center">{monthName}</span>
              <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-[#2a2a32] text-[#606070]"><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="flex gap-3 mb-3 text-[10px] font-nav text-[#606070]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-[#3eb85a]/20 border-[#3eb85a]/40 inline-block" />Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-[#d4880a]/20 border-[#d4880a]/40 inline-block" />Busy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-[#3a3a48]/40 border-[#3a3a48] inline-block" />Unavailable</span>
            <span className="ml-auto">Tap to cycle</span>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <div key={d} className="text-center font-nav text-[10px] text-[#606070] py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDow }).map((_, i) => <div key={`b-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = toDateStr(year, month, day)
              const status  = availability[dateStr]
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
              return (
                <button key={day} onClick={() => handleDayClick(day)} disabled={!!saving}
                  className={`relative aspect-square rounded-lg border font-nav text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-60 ${status ? DAY_COLORS[status] : 'bg-[#0f0f12] border-[#2a2a32] text-[#606070] hover:border-[#606070]'} ${isToday ? 'ring-1 ring-[#c8922a]' : ''}`}>
                  {saving === dateStr ? <RefreshCw size={10} className="animate-spin mx-auto" /> : day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Jobs',   value: activeJobs.length,  color: 'text-[#e8aa40]' },
            { label: 'Crew Size',     value: sub.crew_size,      color: 'text-[#4a9de0]' },
            { label: 'Total Jobs',    value: jobs.length,        color: 'text-[#e8e8ee]' },
          ].map((s) => (
            <div key={s.label} className="bg-[#151518] border border-[#2a2a32] rounded-lg p-3 text-center">
              <p className={`font-display text-2xl ${s.color}`}>{s.value}</p>
              <p className="font-nav text-[10px] text-[#606070] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active Jobs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-[#c8922a]" />
            <span className="font-display text-sm tracking-wider text-[#9090a0]">ACTIVE JOBS</span>
          </div>
          {activeJobs.length === 0 ? (
            <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-8 text-center">
              <HardHat size={28} className="text-[#2a2a32] mx-auto mb-2" />
              <p className="font-nav text-sm text-[#606070]">No active jobs at this time.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeJobs.map((job) => {
                const subSt = (job as any).sub_status
                const pct   = (job as any).sub_progress_pct ?? 0
                return (
                  <a key={job.id} href={`/sub-portal/${subId}/jobs/${job.id}`}
                    className="flex items-center gap-3 bg-[#151518] border border-[#2a2a32] hover:border-[#c8922a]/40 rounded-xl px-4 py-3 transition-colors group block">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[#4a9de0]">{job.job_number}</span>
                        <StatusPill type="status" value={job.status} size="sm" />
                        {subSt && subSt !== 'not_started' && (
                          <span className={`font-nav text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                            subSt === 'work_complete' ? 'text-[#3eb85a] bg-[#3eb85a]/10 border-[#3eb85a]/30' : 'text-[#d4880a] bg-[#d4880a]/10 border-[#d4880a]/30'
                          }`}>{subSt.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                      <p className="font-body text-sm font-semibold text-[#e8e8ee] mt-0.5">{(job.customer as any)?.name ?? job.customer_id}</p>
                      <p className="font-nav text-xs text-[#606070]">{job.address}, {job.city}, {job.state}</p>
                      {pct > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#2a2a32] rounded-full overflow-hidden">
                            <div className="h-full bg-[#c8922a] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-[#606070]">{pct}%</span>
                        </div>
                      )}
                    </div>
                    <span className="font-nav text-xs text-[#606070] group-hover:text-[#e8aa40] transition-colors capitalize flex-shrink-0">{job.trade} →</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Past Jobs */}
        {pastJobs.length > 0 && (
          <div>
            <p className="font-display text-sm tracking-wider text-[#606070] mb-2">PAST JOBS</p>
            <div className="space-y-1.5">
              {pastJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 bg-[#151518] border border-[#2a2a32] rounded-lg px-3 py-2 opacity-60">
                  <span className="font-mono text-xs text-[#606070]">{job.job_number}</span>
                  <span className="font-body text-sm text-[#606070] flex-1">{(job.customer as any)?.name ?? '—'}</span>
                  <StatusPill type="status" value={job.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
