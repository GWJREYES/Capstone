'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Briefcase, FileText, ClipboardCheck, HardHat, Activity, ChevronRight, RefreshCw } from 'lucide-react'
import StatBlock from '@/components/ui/StatBlock'
import StatusPill from '@/components/ui/StatusPill'
import DocLinks from '@/components/ui/DocLinks'
import JobDetailOverlay from '@/components/jobs/JobDetailOverlay'
import { fetchJobs, fetchSubs, updateJob } from '@/lib/api'
import { PIPELINE_STAGES } from '@/lib/constants'

const DOT: Record<string, string> = { available: '#3eb85a', busy: '#d4880a', unavailable: '#606070' }

function timeAgo(dateStr: string) {
  if (!dateStr) return 'recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function buildActivityFeed(jobs: any[]) {
  const sorted = [...jobs].sort((a, b) =>
    new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
  )
  return sorted.slice(0, 8).map((j, i) => {
    const customer = j.customer?.name || j.customer_name || 'Unknown'
    const statusLabel = (j.status || '').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    return {
      id: i,
      time: timeAgo(j.updated_at || j.created_at),
      text: `${j.job_number} · ${customer} — ${statusLabel}`,
    }
  })
}

function pipelineCounts(jobs: any[]) {
  return jobs.reduce((acc: Record<string, number>, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1
    return acc
  }, {})
}

function pipelineValue(jobs: any[]) {
  return jobs.reduce((s: number, j: any) => s + (j.quoted_value || 0), 0)
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [jobData, subData] = await Promise.all([fetchJobs(), fetchSubs()])
      setJobs(jobData)
      setSubs(subData)
    } catch { /* Supabase not yet configured */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (updated: any) => {
    if (!selectedJob) return
    // Optimistic update first so UI feels instant
    setJobs(jobs.map((j) => j.id === selectedJob.id ? { ...j, ...updated } : j))
    setSelectedJob(null)
    const isReal = selectedJob.id && !/^\d+$/.test(selectedJob.id)
    if (isReal) {
      try {
        await updateJob(selectedJob.id, {
          status: updated.status,
          trade: updated.trade,
          quoted_value: updated.quoted_value ? parseFloat(updated.quoted_value) : null,
          notes: updated.notes,
          matterport_url: updated.matterport_url,
          onedrive_url: updated.onedrive_url,
          rilla_url: updated.rilla_url,
        })
      } catch (e: any) {
        // Revert local state if DB save failed
        setJobs(jobs.map((j) => j.id === selectedJob.id ? selectedJob : j))
        alert(`Save failed: ${e.message}`)
      }
    }
  }

  const activityFeed = buildActivityFeed(jobs)
  const counts = pipelineCounts(jobs)
  const total = jobs.length || 1
  const activeJobs = jobs.filter((j) => j.status === 'in_progress').length
  const quotesOut = jobs.filter((j) => j.status === 'quoted').length
  const auditsDue = jobs.filter((j) => !j.audit_complete && ['sold', 'in_progress', 'complete'].includes(j.status)).length
  const pipeline = pipelineValue(jobs)

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">DASHBOARD</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">Sunday, April 20, 2026 · New England Region</p>
          </div>
          <div className="flex items-center gap-3">
            {activeJobs > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#3eb85a]/10 border border-[#3eb85a]/20 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#3eb85a] status-dot-active" />
                <span className="font-nav text-xs font-semibold text-[#3eb85a]">{activeJobs} ACTIVE</span>
              </div>
            )}
            <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatBlock label="Active Jobs" value={loading ? '—' : String(activeJobs)} color="green" icon={<Briefcase size={14} />} />
          <StatBlock label="Pipeline Value" value={loading ? '—' : `$${(pipeline / 1000).toFixed(0)}K`} color="gold" icon={<TrendingUp size={14} />} />
          <StatBlock label="Quotes Out" value={loading ? '—' : String(quotesOut)} color="blue" icon={<FileText size={14} />} />
          <StatBlock label="Audits Due" value={loading ? '—' : String(auditsDue)} color="red" icon={<ClipboardCheck size={14} />} />
          <StatBlock label="Total Jobs" value={loading ? '—' : String(jobs.length)} color="default" icon={<HardHat size={14} />} />
        </div>

        {/* Pipeline Bar */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg tracking-wider text-[#e8e8ee]">PIPELINE</h2>
            <span className="font-mono text-xs text-[#606070]">{jobs.length} TOTAL</span>
          </div>
          {loading ? (
            <div className="h-8 bg-[#0f0f12] rounded animate-pulse" />
          ) : (
            <div className="flex rounded-md overflow-hidden h-8">
              {PIPELINE_STAGES.map((stage) => {
                const count = counts[stage.key] || 0
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={stage.key} style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    className="relative flex items-center justify-center transition-all" title={`${stage.label}: ${count}`}>
                    {pct > 8 && <span className="font-nav text-[10px] font-bold text-white/90 select-none">{count}</span>}
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: stage.color }} />
                <span className="font-nav text-[11px] text-[#9090a0]">
                  {stage.label} <span className="text-[#606070]">({counts[stage.key] || 0})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent Jobs */}
          <div className="xl:col-span-2 bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a32]">
              <h2 className="font-display text-base tracking-wider text-[#e8e8ee]">RECENT JOBS</h2>
              <a href="/jobs" className="flex items-center gap-1 font-nav text-xs text-[#c8922a] hover:text-[#e8aa40]">
                View all <ChevronRight size={12} />
              </a>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-[#0f0f12] rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a32]">
                      <th className="text-left px-4 py-2 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Job #</th>
                      <th className="text-left px-4 py-2 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Customer</th>
                      <th className="text-left px-4 py-2 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Trade</th>
                      <th className="text-left px-4 py-2 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Status</th>
                      <th className="text-right px-4 py-2 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Value</th>
                      <th className="text-left px-4 py-2 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">Docs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.slice(0, 8).map((job) => (
                      <tr key={job.id} onClick={() => setSelectedJob(job)} className="border-b border-[#2a2a32]/50 table-row-hover">
                        <td className="px-4 py-3"><span className="font-mono text-xs text-[#4a9de0]">{job.job_number}</span></td>
                        <td className="px-4 py-3">
                          <p className="font-body text-sm text-[#e8e8ee]">{job.customer?.name || job.customer_name || '—'}</p>
                          <p className="font-nav text-[11px] text-[#606070]">{job.customer?.city || job.customer_city}, {job.customer?.state || job.customer_state}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell"><StatusPill type="trade" value={job.trade} /></td>
                        <td className="px-4 py-3"><StatusPill type="status" value={job.status} /></td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          <span className="font-mono text-sm text-[#e8e8ee]">
                            {job.quoted_value ? `$${Number(job.quoted_value).toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <DocLinks matterport_url={job.matterport_url} onedrive_url={job.onedrive_url} rilla_url={job.rilla_url} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobs.length === 0 && (
                  <p className="text-center py-10 font-nav text-sm text-[#606070]">No jobs yet. <a href="/jobs" className="text-[#c8922a]">Create one →</a></p>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a32]">
                <Activity size={14} className="text-[#c8922a]" />
                <h2 className="font-display text-base tracking-wider text-[#e8e8ee]">ACTIVITY</h2>
              </div>
              <div className="divide-y divide-[#2a2a32]/50">
                {loading ? (
                  [...Array(5)].map((_, i) => <div key={i} className="px-4 py-2.5 h-8 animate-pulse bg-[#151518]" />)
                ) : activityFeed.length > 0 ? activityFeed.map((item) => (
                  <div key={item.id} className="px-4 py-2.5 flex gap-3">
                    <span className="font-mono text-[10px] text-[#606070] whitespace-nowrap mt-0.5">{item.time}</span>
                    <p className="font-body text-xs text-[#9090a0] leading-relaxed">{item.text}</p>
                  </div>
                )) : (
                  <p className="px-4 py-4 font-nav text-xs text-[#606070]">No recent activity.</p>
                )}
              </div>
            </div>

            <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2a32]">
                <h2 className="font-display text-base tracking-wider text-[#e8e8ee]">SUBS AVAILABILITY</h2>
              </div>
              <div className="divide-y divide-[#2a2a32]/50">
                {subs.length === 0 ? (
                  <p className="px-4 py-4 font-nav text-xs text-[#606070]">No subcontractors added yet. <a href="/subs" className="text-[#c8922a]">Add one →</a></p>
                ) : subs.slice(0, 6).map((sub) => (
                  <div key={sub.id} className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DOT[sub.status] || DOT.unavailable }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-[#e8e8ee] truncate">{sub.company}</p>
                      <p className="font-nav text-[10px] text-[#606070] capitalize">{sub.trade}</p>
                    </div>
                    <span className="font-nav text-[10px] capitalize" style={{ color: DOT[sub.status] || DOT.unavailable }}>{sub.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobDetailOverlay job={selectedJob} onClose={() => setSelectedJob(null)} onSave={handleSave} />
      )}
    </div>
  )
}
