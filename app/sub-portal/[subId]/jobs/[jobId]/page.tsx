'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, HardHat, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, FileText, Link as LinkIcon } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import DailyUpdateForm from '@/components/jobs/DailyUpdateForm'
import { Job } from '@/types'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const SUB_STATUSES = [
  { value: 'not_started',      label: 'Not Started',      color: 'text-[#606070]',  bg: 'bg-[#2a2a32]/60 border-[#3a3a48]' },
  { value: 'mobilizing',       label: 'Mobilizing',       color: 'text-[#4a9de0]',  bg: 'bg-[#4a9de0]/10 border-[#4a9de0]/30' },
  { value: 'in_progress',      label: 'In Progress',      color: 'text-[#d4880a]',  bg: 'bg-[#d4880a]/10 border-[#d4880a]/30' },
  { value: 'punch_list',       label: 'Punch List',       color: 'text-[#a070e0]',  bg: 'bg-[#a070e0]/10 border-[#a070e0]/30' },
  { value: 'work_complete',    label: 'Work Complete',    color: 'text-[#3eb85a]',  bg: 'bg-[#3eb85a]/10 border-[#3eb85a]/30' },
]

export default function SubPortalJobDetail() {
  const { subId, jobId } = useParams<{ subId: string; jobId: string }>()
  const router = useRouter()
  const [job, setJob]           = useState<Job | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Sub work state (pulled from job)
  const [subStatus, setSubStatus]   = useState('not_started')
  const [progressPct, setProgressPct] = useState(0)

  useEffect(() => {
    const load = async () => {
      // Auth guard
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) { router.replace('/sub-portal'); return }

      try {
        const res  = await fetch(`/api/jobs/${jobId}`)
        const json = await res.json()
        const data = json.data ?? json
        if (!data || data.error) { setNotFound(true); return }
        setJob(data)
        setSubStatus((data as any).sub_status ?? 'not_started')
        setProgressPct((data as any).sub_progress_pct ?? 0)
      } catch { setNotFound(true) }
      finally { setLoading(false) }
    }
    load()
  }, [jobId, router])

  const handleSaveProgress = async () => {
    if (!job) return
    setSaving(true)
    setError(null)
    try {
      const isComplete = subStatus === 'work_complete'
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub_status: subStatus,
          sub_progress_pct: progressPct,
          sub_last_update: new Date().toISOString(),
          // When sub marks work complete, push job to in_progress so GC knows to inspect
          ...(isComplete && job.status === 'scheduled' ? { status: 'in_progress' } : {}),
        }),
      })
      if (!res.ok) throw new Error('Failed to save progress')

      // Create GC notification if work complete
      if (isComplete) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type:           'work_complete',
            title:          'Work Complete',
            body:           `${(job as any).subcontractor?.company ?? 'Sub'} marked ${job.job_number} as work complete. Ready for inspection.`,
            target_type:    'admin',
            reference_type: 'job',
            reference_id:   jobId,
          }),
        })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Update local job state
      setJob((j) => j ? { ...j, sub_status: subStatus, sub_progress_pct: progressPct } as any : j)
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><RefreshCw size={24} className="text-[#c8922a] animate-spin" /></div>

  if (notFound || !job) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle size={36} className="text-[#b83232] mb-3" />
      <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">JOB NOT FOUND</h2>
      <a href={`/sub-portal/${subId}`} className="mt-4 font-nav text-sm text-[#c8922a] hover:text-[#e8aa40]">← Back to Dashboard</a>
    </div>
  )

  const customer    = job.customer as any
  const currentStep = SUB_STATUSES.findIndex((s) => s.value === subStatus)

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <div className="bg-[#0c1221] border-b border-[#1a2844] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push(`/sub-portal/${subId}`)} className="p-1.5 rounded-md text-[#606070] hover:text-[#e8e8ee] transition-colors">
          <ArrowLeft size={18} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capstone" className="h-8 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <span className="font-mono text-sm text-[#4a9de0] ml-auto">{job.job_number}</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Job overview card */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusPill type="status" value={job.status} />
                <StatusPill type="trade" value={job.trade} />
              </div>
              <h2 className="font-body text-lg font-semibold text-[#e8e8ee]">{customer?.name ?? 'Unknown Customer'}</h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#c8922a]/10 border border-[#c8922a]/20 flex items-center justify-center flex-shrink-0">
              <HardHat size={18} className="text-[#c8922a]" />
            </div>
          </div>
          <div className="flex items-start gap-2 mb-2">
            <MapPin size={12} className="text-[#606070] mt-0.5 flex-shrink-0" />
            <p className="font-body text-xs text-[#9090a0]">{job.address}, {job.city}, {job.state}</p>
          </div>
          {job.notes && (
            <div className="mt-3 pt-3 border-t border-[#2a2a32]">
              <p className="font-nav text-[9px] uppercase tracking-wider text-[#3a3a48] mb-1">GC Notes</p>
              <p className="font-body text-xs text-[#9090a0] leading-relaxed">{job.notes}</p>
            </div>
          )}
          {/* Document links */}
          {(job.matterport_url || job.onedrive_url) && (
            <div className="mt-3 pt-3 border-t border-[#2a2a32] flex gap-3">
              {job.matterport_url && <a href={job.matterport_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-nav text-xs text-[#4a9de0] hover:underline"><LinkIcon size={11} />3D Tour</a>}
              {job.onedrive_url && <a href={job.onedrive_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-nav text-xs text-[#4a9de0] hover:underline"><FileText size={11} />Documents</a>}
            </div>
          )}
        </div>

        {/* ── Work Progression ── */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={14} className="text-[#c8922a]" />
            <span className="font-display text-sm tracking-wider text-[#9090a0]">WORK PROGRESSION</span>
          </div>

          {/* Status pipeline — tap to select */}
          <div className="space-y-2 mb-5">
            {SUB_STATUSES.map((st, idx) => {
              const isSelected = subStatus === st.value
              const isPast     = idx < currentStep
              return (
                <button key={st.value} onClick={() => setSubStatus(st.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${isSelected ? `${st.bg} ${st.color}` : isPast ? 'border-[#2a2a32] bg-[#0f0f12] opacity-50' : 'border-[#2a2a32] bg-[#0f0f12] text-[#606070] hover:border-[#606070]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-current bg-current/20' : 'border-[#3a3a48]'}`}>
                    {(isSelected || isPast) && <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <span className="font-nav text-sm font-semibold">{st.label}</span>
                  {st.value === 'work_complete' && <span className="ml-auto font-nav text-[10px] text-[#606070]">Notifies GC</span>}
                </button>
              )
            })}
          </div>

          {/* Progress slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070]">Overall Progress</label>
              <span className="font-mono text-sm text-[#c8922a] font-bold">{progressPct}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={progressPct}
              onChange={(e) => setProgressPct(Number(e.target.value))}
              className="w-full accent-[#c8922a] cursor-pointer" />
            <div className="flex justify-between font-nav text-[9px] text-[#3a3a48] mt-1">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>

          {/* Work complete warning */}
          {subStatus === 'work_complete' && (
            <div className="mb-4 px-3 py-2 bg-[#3eb85a]/10 border border-[#3eb85a]/30 rounded-lg">
              <p className="font-body text-xs text-[#3eb85a]">
                Marking work complete will notify Capstone to schedule an inspection. Make sure all work is finished before saving.
              </p>
            </div>
          )}

          {error && <div className="mb-3 px-3 py-2 bg-[#b83232]/10 border border-[#b83232]/30 rounded-lg"><p className="font-body text-xs text-[#b83232]">{error}</p></div>}

          <button onClick={handleSaveProgress} disabled={saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-display text-base tracking-wider transition-colors disabled:opacity-60 ${saved ? 'bg-[#3eb85a] text-white' : 'bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b]'}`}>
            {saving ? <><RefreshCw size={15} className="animate-spin" />Saving…</> : saved ? <><CheckCircle2 size={15} />Saved!</> : 'SAVE PROGRESS'}
          </button>
        </div>

        {/* Daily Updates */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <DailyUpdateForm
            jobId={jobId}
            subId={subId}
            subCompany={(job.subcontractor as any)?.company}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  )
}
