'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Send, ChevronDown, ChevronUp, Sun } from 'lucide-react'
import { SubDailyUpdate } from '@/types'
import { fetchDailyUpdates, createDailyUpdate } from '@/lib/api'

const WEATHER_OPTIONS = ['Clear', 'Cloudy', 'Rainy', 'Windy', 'Snow', 'Hot']

interface Props {
  jobId: string
  subId?: string
  subCompany?: string
  readOnly?: boolean
}

export default function DailyUpdateForm({ jobId, subId, subCompany, readOnly = false }: Props) {
  const [updates, setUpdates]     = useState<SubDailyUpdate[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    update_date:       new Date().toISOString().split('T')[0],
    crew_on_site:      1,
    hours_worked:      8,
    work_completed:    '',
    work_planned:      '',
    blockers:          '',
    materials_needed:  '',
    weather:           'Clear',
    completion_pct:    0,
  })

  useEffect(() => {
    fetchDailyUpdates(jobId, subId).then(setUpdates).finally(() => setLoading(false))
  }, [jobId, subId])

  const handleSubmit = async () => {
    if (!form.work_completed.trim()) return
    setSubmitting(true)
    try {
      const created = await createDailyUpdate({
        job_id: jobId,
        subcontractor_id: subId,
        ...form,
      })
      setUpdates((u) => [created, ...u])
      setSubmitted(true)
      setShowForm(false)
      setForm({ update_date: new Date().toISOString().split('T')[0], crew_on_site: 1, hours_worked: 8, work_completed: '', work_planned: '', blockers: '', materials_needed: '', weather: 'Clear', completion_pct: 0 })
      setTimeout(() => setSubmitted(false), 4000)
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-[#c8922a]" />
          <span className="font-display text-sm tracking-wider text-[#9090a0]">DAILY UPDATES</span>
          {updates.length > 0 && (
            <span className="font-mono text-[10px] text-[#606070] bg-[#151518] border border-[#2a2a32] px-1.5 py-0.5 rounded">
              {updates.length}
            </span>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#c8922a]/10 border border-[#c8922a]/30 hover:bg-[#c8922a]/20 rounded-md font-nav text-xs font-semibold text-[#e8aa40] transition-colors"
          >
            <Send size={12} /> Submit Update
          </button>
        )}
      </div>

      {submitted && (
        <div className="px-3 py-2 bg-green-900/20 border border-[#3eb85a]/30 rounded-md">
          <p className="font-nav text-xs text-[#3eb85a]">Update submitted successfully.</p>
        </div>
      )}

      {/* Submit form */}
      {showForm && !readOnly && (
        <div className="bg-[#0f0f12] border border-[#c8922a]/20 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Date</label>
              <input type="date" value={form.update_date} onChange={(e) => setForm({ ...form, update_date: e.target.value })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Crew on Site</label>
              <input type="number" min="1" value={form.crew_on_site} onChange={(e) => setForm({ ...form, crew_on_site: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Hours Worked</label>
              <input type="number" min="0" step="0.5" value={form.hours_worked} onChange={(e) => setForm({ ...form, hours_worked: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Weather</label>
              <select value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-nav text-xs text-[#e8e8ee] input-gold">
                {WEATHER_OPTIONS.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Completion slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070]">Overall Completion</label>
              <span className="font-mono text-sm text-[#e8aa40] font-semibold">{form.completion_pct}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={form.completion_pct}
              onChange={(e) => setForm({ ...form, completion_pct: parseInt(e.target.value) })}
              className="w-full accent-[#c8922a]"
            />
            <div className="w-full h-1.5 bg-[#151518] rounded-full overflow-hidden mt-1">
              <div className="h-full pipeline-bar rounded-full transition-all" style={{ width: `${form.completion_pct}%` }} />
            </div>
          </div>

          <div>
            <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Work Completed Today <span className="text-[#b83232]">*</span></label>
            <textarea value={form.work_completed} onChange={(e) => setForm({ ...form, work_completed: e.target.value })}
              rows={3} placeholder="Describe what was done today..."
              className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#3a3a48] input-gold resize-none" />
          </div>
          <div>
            <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Planned for Tomorrow</label>
            <textarea value={form.work_planned} onChange={(e) => setForm({ ...form, work_planned: e.target.value })}
              rows={2} placeholder="What's next..."
              className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#3a3a48] input-gold resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Blockers / Issues</label>
              <input type="text" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                placeholder="Any delays or blockers" className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-body text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Materials Needed</label>
              <input type="text" value={form.materials_needed} onChange={(e) => setForm({ ...form, materials_needed: e.target.value })}
                placeholder="Anything to order" className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-body text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSubmit} disabled={submitting || !form.work_completed.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-md font-nav text-sm font-semibold transition-colors disabled:opacity-50">
              <Send size={13} />
              {submitting ? 'Submitting…' : 'Submit Update'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-[#151518] border border-[#2a2a32] text-[#9090a0] rounded-md font-nav text-sm transition-colors hover:text-[#e8e8ee]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Updates list */}
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#151518] rounded animate-pulse" />)}</div>
      ) : updates.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardList size={24} className="text-[#2a2a32] mx-auto mb-2" />
          <p className="font-nav text-xs text-[#606070]">No updates submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {updates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>
      )}
    </div>
  )
}

function UpdateCard({ update: u }: { update: SubDailyUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const sub = (u as any).subcontractor

  return (
    <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-[#4a9de0]">{u.update_date}</span>
            {sub?.company && <span className="font-nav text-xs text-[#606070]">{sub.company}</span>}
            {u.weather && (
              <span className="flex items-center gap-0.5 font-nav text-[10px] text-[#606070]">
                <Sun size={10} /> {u.weather}
              </span>
            )}
          </div>
          <p className="font-body text-xs text-[#9090a0] mt-0.5 truncate">{u.work_completed}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-[#e8aa40]">{u.completion_pct}%</span>
            <p className="font-nav text-[9px] text-[#606070]">{u.crew_on_site} crew · {u.hours_worked}h</p>
          </div>
          {expanded ? <ChevronUp size={13} className="text-[#606070]" /> : <ChevronDown size={13} className="text-[#606070]" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#2a2a32] px-3 py-2.5 space-y-1.5">
          {u.work_planned && <Detail label="Tomorrow" value={u.work_planned} />}
          {u.blockers && <Detail label="Blockers" value={u.blockers} color="text-[#d4880a]" />}
          {u.materials_needed && <Detail label="Materials Needed" value={u.materials_needed} />}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, color = 'text-[#9090a0]' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <span className="font-nav text-[9px] uppercase tracking-wider text-[#3a3a48]">{label}: </span>
      <span className={`font-body text-xs ${color}`}>{value}</span>
    </div>
  )
}
