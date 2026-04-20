'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

const PENDING_AUDITS = [
  {
    id: '1',
    job_id: 'JOB-0001',
    customer: 'Rivera Residence',
    tech_name: 'Carlos Rivera',
    rilla_score: 84,
    talk_ratio: 68,
    open_questions: 4,
    duration_minutes: 52,
    outcome: 'Quote Sent',
    rilla_reviewed: true,
    matterport_complete: true,
    go3s_uploaded: false,
    follow_up_sent: true,
    quote_generated: true,
    coaching_note: 'Great open-ended questions. Work on presenting pricing earlier.',
  },
  {
    id: '2',
    job_id: 'JOB-0002',
    customer: 'Walsh Commercial',
    tech_name: 'Marcus Walsh',
    rilla_score: 71,
    talk_ratio: 72,
    open_questions: 2,
    duration_minutes: 38,
    outcome: 'Follow-up Needed',
    rilla_reviewed: true,
    matterport_complete: true,
    go3s_uploaded: true,
    follow_up_sent: false,
    quote_generated: false,
    coaching_note: '',
  },
  {
    id: '3',
    job_id: 'JOB-0004',
    customer: 'Kowalski Home',
    tech_name: 'Jake Torres',
    rilla_score: 62,
    talk_ratio: 81,
    open_questions: 1,
    duration_minutes: 29,
    outcome: 'No Decision',
    rilla_reviewed: false,
    matterport_complete: true,
    go3s_uploaded: false,
    follow_up_sent: false,
    quote_generated: false,
    coaching_note: '',
  },
  {
    id: '4',
    job_id: 'JOB-0005',
    customer: 'Patel Properties',
    tech_name: 'Sofia Chen',
    rilla_score: 78,
    talk_ratio: 61,
    open_questions: 6,
    duration_minutes: 65,
    outcome: 'Quote Requested',
    rilla_reviewed: false,
    matterport_complete: false,
    go3s_uploaded: false,
    follow_up_sent: false,
    quote_generated: false,
    coaching_note: '',
  },
]

const TEAM_PERFORMANCE = [
  { name: 'Carlos Rivera', appointments: 8, avg_score: 81, close_rate: 62 },
  { name: 'Sofia Chen', appointments: 6, avg_score: 77, close_rate: 50 },
  { name: 'Marcus Walsh', appointments: 5, avg_score: 68, close_rate: 40 },
  { name: 'Jake Torres', appointments: 9, avg_score: 65, close_rate: 33 },
]

const CHECKLIST_ITEMS = [
  { key: 'rilla_reviewed', label: 'Rilla Reviewed' },
  { key: 'matterport_complete', label: 'Matterport Complete' },
  { key: 'go3s_uploaded', label: 'GO 3S Uploaded' },
  { key: 'follow_up_sent', label: 'Follow-up Sent' },
  { key: 'quote_generated', label: 'Quote Generated' },
]

function scoreColor(score: number) {
  if (score >= 80) return '#3eb85a'
  if (score >= 65) return '#d4880a'
  return '#b83232'
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-900/20 border-green-dim/30'
  if (score >= 65) return 'bg-amber-900/20 border-amber-800/30'
  return 'bg-red-900/20 border-red-800/30'
}

export default function AuditPage() {
  const [audits, setAudits] = useState(PENDING_AUDITS)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleCheck = (auditId: string, key: string) => {
    setAudits(audits.map((a) =>
      a.id === auditId ? { ...a, [key]: !a[key as keyof typeof a] } : a
    ))
  }

  const updateNote = (auditId: string, note: string) => {
    setAudits(audits.map((a) => a.id === auditId ? { ...a, coaching_note: note } : a))
  }

  const completedCount = (audit: typeof PENDING_AUDITS[0]) =>
    CHECKLIST_ITEMS.filter((item) => audit[item.key as keyof typeof audit]).length

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">AUDIT</h1>
        <p className="font-nav text-sm text-[#606070] mt-0.5">Sales call review &amp; performance tracking</p>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Pending Audit Cards */}
        <div>
          <h2 className="font-display text-lg tracking-wider text-[#9090a0] mb-3">PENDING AUDITS</h2>
          <div className="space-y-3">
            {audits.map((audit) => {
              const isExpanded = expandedId === audit.id
              const done = completedCount(audit)
              const total = CHECKLIST_ITEMS.length

              return (
                <div
                  key={audit.id}
                  className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#1c1c21] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : audit.id)}
                  >
                    {/* Score circle */}
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0`}
                      style={{
                        borderColor: scoreColor(audit.rilla_score),
                        boxShadow: `0 0 10px ${scoreColor(audit.rilla_score)}25`,
                      }}
                    >
                      <span className="font-display text-lg" style={{ color: scoreColor(audit.rilla_score) }}>
                        {audit.rilla_score}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[#4a9de0]">{audit.job_id}</span>
                        <span className="font-body text-sm font-semibold text-[#e8e8ee]">{audit.customer}</span>
                      </div>
                      <p className="font-nav text-xs text-[#606070]">{audit.tech_name}</p>
                    </div>

                    {/* Stats - hidden on small */}
                    <div className="hidden sm:flex items-center gap-4 text-center">
                      <div>
                        <p className="font-mono text-xs text-[#9090a0]">{audit.talk_ratio}%</p>
                        <p className="font-nav text-[10px] text-[#606070]">Talk</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[#9090a0]">{audit.open_questions}</p>
                        <p className="font-nav text-[10px] text-[#606070]">Open Q</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[#9090a0]">{audit.duration_minutes}m</p>
                        <p className="font-nav text-[10px] text-[#606070]">Duration</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[#e8aa40]">{audit.outcome}</p>
                        <p className="font-nav text-[10px] text-[#606070]">Outcome</p>
                      </div>
                    </div>

                    {/* Progress + expand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden xs:block">
                        <span className="font-mono text-xs text-[#606070]">{done}/{total}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-[#606070]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#606070]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded checklist */}
                  {isExpanded && (
                    <div className="border-t border-[#2a2a32] px-4 py-3 bg-[#0f0f12]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {CHECKLIST_ITEMS.map((item) => {
                          const checked = audit[item.key as keyof typeof audit] as boolean
                          return (
                            <button
                              key={item.key}
                              onClick={() => toggleCheck(audit.id, item.key)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded border transition-all text-left ${
                                checked
                                  ? 'border-[#3eb85a]/30 bg-[#3eb85a]/10'
                                  : 'border-[#2a2a32] bg-[#151518] hover:border-[#606070]'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                                checked ? 'bg-[#3eb85a]' : 'border border-[#2a2a32]'
                              }`}>
                                {checked && <Check size={10} className="text-[#09090b]" />}
                              </div>
                              <span className={`font-nav text-xs ${checked ? 'text-[#3eb85a]' : 'text-[#9090a0]'}`}>
                                {item.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Coaching note */}
                      <div>
                        <label className="flex items-center gap-1.5 font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1">
                          <MessageSquare size={10} />
                          Coaching Note
                        </label>
                        <textarea
                          value={audit.coaching_note}
                          onChange={(e) => updateNote(audit.id, e.target.value)}
                          rows={2}
                          placeholder="Add coaching feedback..."
                          className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-body text-xs text-[#e8e8ee] placeholder-[#606070] input-gold resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a32]">
            <h2 className="font-display text-lg tracking-wider text-[#e8e8ee]">TEAM PERFORMANCE</h2>
          </div>
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
                {TEAM_PERFORMANCE.map((member) => (
                  <tr key={member.name} className="border-b border-[#2a2a32]/50">
                    <td className="px-4 py-3">
                      <span className="font-body text-sm text-[#e8e8ee]">{member.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm text-[#9090a0]">{member.appointments}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#0f0f12] rounded-full max-w-[100px]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${member.avg_score}%`,
                              backgroundColor: scoreColor(member.avg_score),
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs" style={{ color: scoreColor(member.avg_score) }}>
                          {member.avg_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#0f0f12] rounded-full max-w-[80px]">
                          <div
                            className="h-full rounded-full bg-[#4a9de0]"
                            style={{ width: `${member.close_rate}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[#4a9de0]">{member.close_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
