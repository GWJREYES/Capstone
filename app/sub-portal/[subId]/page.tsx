'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { HardHat, Briefcase, RefreshCw, Radio, AlertTriangle } from 'lucide-react'
import { Subcontractor, Job, SubStatus } from '@/types'
import StatusPill from '@/components/ui/StatusPill'
import { STATUS_STYLES } from '@/lib/constants'

const STATUS_OPTIONS: { value: SubStatus; label: string; color: string }[] = [
  { value: 'available',   label: 'Available',   color: 'text-[#3eb85a]' },
  { value: 'busy',        label: 'Busy',         color: 'text-[#d4880a]' },
  { value: 'unavailable', label: 'Unavailable',  color: 'text-[#606070]' },
]

export default function SubPortalDashboard() {
  const { subId } = useParams<{ subId: string }>()
  const [sub, setSub]         = useState<Subcontractor | null>(null)
  const [jobs, setJobs]       = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [subsRes, jobsRes] = await Promise.all([
          fetch('/api/subs'),
          fetch('/api/jobs'),
        ])
        const subs = await subsRes.json()
        const allJobs = await jobsRes.json()
        const found = Array.isArray(subs) ? subs.find((s: any) => s.id === subId) : null
        if (!found) { setNotFound(true); return }
        setSub(found)
        const assigned = Array.isArray(allJobs)
          ? allJobs.filter((j: any) => j.subcontractor_id === subId || j.subcontractor?.id === subId)
          : []
        setJobs(assigned)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [subId])

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

  const activeJobs = jobs.filter((j) => ['scheduled','in_progress','sold'].includes(j.status))
  const pastJobs   = jobs.filter((j) => ['complete','cancelled'].includes(j.status))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <RefreshCw size={24} className="text-[#c8922a] animate-spin" />
      </div>
    )
  }

  if (notFound || !sub) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle size={36} className="text-[#b83232] mb-3" />
        <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">ACCOUNT NOT FOUND</h2>
        <p className="font-body text-sm text-[#606070] mt-2">This portal link is invalid or your account is pending approval.</p>
        <a href="/sub-portal" className="mt-4 font-nav text-sm text-[#c8922a] hover:text-[#e8aa40] transition-colors">
          ← Back to Portal
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Portal header */}
      <div className="bg-[#0c1221] border-b border-[#1a2844] px-4 py-3 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capstone" className="h-10 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="text-right">
          <p className="font-body text-sm font-semibold text-[#e8e8ee]">{sub.company}</p>
          <p className="font-nav text-xs text-[#606070] capitalize">{sub.trade}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Availability toggle */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Radio size={14} className="text-[#c8922a]" />
            <span className="font-display text-sm tracking-wider text-[#9090a0]">YOUR AVAILABILITY</span>
            {updating && <RefreshCw size={12} className="text-[#606070] animate-spin ml-auto" />}
          </div>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                disabled={updating}
                className={`flex-1 py-2.5 rounded-lg border font-nav text-xs font-semibold tracking-wider transition-all ${
                  sub.status === opt.value
                    ? `${opt.color} border-current bg-current/10`
                    : 'text-[#606070] border-[#2a2a32] bg-[#0f0f12] hover:border-[#606070]'
                }`}
              >
                {opt.label.toUpperCase()}
              </button>
            ))}
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
              {activeJobs.map((job) => (
                <a
                  key={job.id}
                  href={`/sub-portal/${subId}/jobs/${job.id}`}
                  className="flex items-center gap-3 bg-[#151518] border border-[#2a2a32] hover:border-[#c8922a]/40 rounded-xl px-4 py-3 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-[#4a9de0]">{job.job_number}</span>
                      <StatusPill type="status" value={job.status} size="sm" />
                    </div>
                    <p className="font-body text-sm font-semibold text-[#e8e8ee] mt-0.5">
                      {(job.customer as any)?.name ?? job.customer_id}
                    </p>
                    <p className="font-nav text-xs text-[#606070]">
                      {job.address}, {job.city}, {job.state}
                    </p>
                  </div>
                  <span className="font-nav text-xs text-[#606070] group-hover:text-[#e8aa40] transition-colors capitalize">
                    {job.trade} →
                  </span>
                </a>
              ))}
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
