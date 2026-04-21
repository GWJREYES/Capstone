'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, ChevronUp, MessageSquare, RefreshCw } from 'lucide-react'
import { fetchAudits, updateAudit } from '@/lib/api'

const CHECKLIST_ITEMS = [
  { key: 'rilla_reviewed', label: 'Rilla Reviewed' },
  { key: 'matterport_complete', label: 'Matterport Complete' },
  { key: 'go3s_uploaded', label: 'GO 3S Uploaded' },
  { key: 'follow_up_sent', label: 'Follow-up Sent' },
  { key: 'quote_generated', label: 'Quote Generated' },
]

function buildTeamPerformance(audits: any[]) {
  const byTech: Record<string, { scores: number[]; total: number; closed: number }> = {}
  for (const a of audits) {
    const name = a.tech_name || 'Unknown'
    if (!byTech[name]) byTech[name] = { scores: [], total: 0, closed: 0 }
    byTech[name].total++
    if (a.rilla_score) byTech[name].scores.push(a.rilla_score)
    const outcome = (a.outcome || '').toLowerCase()
    if (outcome.includes('sold') || outcome.includes('quote') || outcome.includes('signed')) {
      byTech[name].closed++
    }
  }
  return Object.entries(byTech)
    .map(([name, d]) => ({
      name,
      appointments: d.total,
      avg_score: d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
      close_rate: d.total > 0 ? Math.round((d.closed / d.total) * 100) : 0,
    }))
    .sort((a, b) => b.avg_score - a.avg_score)
}

function scoreColor(score: number) {
  if (score >= 80) return '#3eb85a'
  if (score >= 65) return '#d4880a'
  return '#b83232'
}

export default function AuditPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set())

  const load = async () => {
    setLoading(true)
    try { setAudits(await fetchAudits()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggleCheck = async (auditId: string, key: string) => {
    const audit = audits.find((a) => a.id === auditId)
    if (!audit) return
    const newVal = !audit[key]
    setAudits(audits.map((a) => a.id === auditId ? { ...a, [key]: newVal } : a))

    const isRealId = !/^\d+$/.test(auditId)
    if (isRealId) {
      setPendingSaves((s) => new Set(s).add(auditId))
      try { await updateAudit(auditId, { [key]: newVal }) } catch { /* offline — state already updated */ }
      finally { setPendingSaves((s) => { const n = new Set(s); n.delete(auditId); return n }) }
    }
  }

  const updateNote = async (auditId: string, note: string) => {
    setAudits(audits.map((a) => a.id === auditId ? { ...a, coaching_note: note } : a))
  }

  const saveNote = async (auditId: string, note: string) => {
    const isRealId = !/^\d+$/.test(auditId)
    if (!isRealId) return
    try { await updateAudit(auditId, { coaching_note: note }) } catch { /* offline */ }
  }

  const completedCount = (audit: any) =>
    CHECKLIST_ITEMS.filter((item) => audit[item.key]).length

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">AUDIT</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">Sales call review &amp; performance tracking</p>
          </div>
          <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h2 className="font-display text-lg tracking-wider text-[#9090a0] mb-3">PENDING AUDITS</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#151518] rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {audits.map((audit) => {
                const isExpanded = expandedId === audit.id
                const done = completedCount(audit)
                const isSaving = pendingSaves.has(audit.id)

                return (
                  <div key={audit.id} className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
                    <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#1c1c21] transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : audit.id)}>
                      <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: scoreColor(audit.rilla_score), boxShadow: `0 0 10px ${scoreColor(audit.rilla_score)}25` }}>
                        <span className="font-display text-lg" style={{ color: scoreColor(audit.rilla_score) }}>{audit.rilla_score}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-[#4a9de0]">{audit.job_id}</span>
                          <span className="font-body text-sm font-semibold text-[#e8e8ee]">{audit.customer}</span>
                          {isSaving && <RefreshCw size={11} className="text-[#606070] animate-spin" />}
                        </div>
                        <p className="font-nav text-xs text-[#606070]">{audit.tech_name}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-center">
                        <div><p className="font-mono text-xs text-[#9090a0]">{audit.talk_ratio}%</p><p className="font-nav text-[10px] text-[#606070]">Talk</p></div>
                        <div><p className="font-mono text-xs text-[#9090a0]">{audit.open_questions}</p><p className="font-nav text-[10px] text-[#606070]">Open Q</p></div>
                        <div><p className="font-mono text-xs text-[#9090a0]">{audit.duration_minutes}m</p><p className="font-nav text-[10px] text-[#606070]">Duration</p></div>
                        <div><p className="font-mono text-xs text-[#e8aa40]">{audit.outcome}</p><p className="font-nav text-[10px] text-[#606070]">Outcome</p></div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono text-xs text-[#606070]">{done}/{CHECKLIST_ITEMS.length}</span>
                        {isExpanded ? <ChevronUp size={14} className="text-[#606070]" /> : <ChevronDown size={14} className="text-[#606070]" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#2a2a32] px-4 py-3 bg-[#0f0f12]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {CHECKLIST_ITEMS.map((item) => {
                            const checked = !!audit[item.key]
                            return (
                              <button key={item.key} onClick={() => toggleCheck(audit.id, item.key)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded border transition-all text-left ${
                                  checked ? 'border-[#3eb85a]/30 bg-[#3eb85a]/10' : 'border-[#2a2a32] bg-[#151518] hover:border-[#606070]'
                                }`}>
                                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#3eb85a]' : 'border border-[#2a2a32]'}`}>
                                  {checked && <Check size={10} className="text-[#09090b]" />}
                                </div>
                                <span className={`font-nav text-xs ${checked ? 'text-[#3eb85a]' : 'text-[#9090a0]'}`}>{item.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1">
                            <MessageSquare size={10} /> Coaching Note
                          </label>
                          <textarea value={audit.coaching_note || ''} rows={2}
                            onChange={(e) => updateNote(audit.id, e.target.value)}
                            onBlur={(e) => saveNote(audit.id, e.target.value)}
                            placeholder="Add coaching feedback..."
                            className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-body text-xs text-[#e8e8ee] placeholder-[#606070] input-gold resize-none" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {audits.length === 0 && (
                <p className="text-center py-10 font-nav text-sm text-[#606070]">No audit records yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Team Performance */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a32]">
            <h2 className="font-display text-lg tracking-wider text-[#e8e8ee]">TEAM PERFORMANCE</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#0f0f12] rounded animate-pulse" />)}</div>
          ) : (() => {
            const teamData = buildTeamPerformance(audits)
            if (teamData.length === 0) return (
              <p className="text-center py-8 font-nav text-sm text-[#606070]">No data yet — audits will populate this table.</p>
            )
            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a32]">
                      <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Tech</th>
                      <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Appts</th>
                      <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Avg Score</th>
                      <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Close Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map((m) => (
                      <tr key={m.name} className="border-b border-[#2a2a32]/50">
                        <td className="px-4 py-3"><span className="font-body text-sm text-[#e8e8ee]">{m.name}</span></td>
                        <td className="px-4 py-3 text-right"><span className="font-mono text-sm text-[#9090a0]">{m.appointments}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#0f0f12] rounded-full max-w-[100px]">
                              <div className="h-full rounded-full" style={{ width: `${m.avg_score}%`, backgroundColor: scoreColor(m.avg_score) }} />
                            </div>
                            <span className="font-mono text-xs" style={{ color: scoreColor(m.avg_score) }}>{m.avg_score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#0f0f12] rounded-full max-w-[80px]">
                              <div className="h-full rounded-full bg-[#4a9de0]" style={{ width: `${m.close_rate}%` }} />
                            </div>
                            <span className="font-mono text-xs text-[#4a9de0]">{m.close_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
