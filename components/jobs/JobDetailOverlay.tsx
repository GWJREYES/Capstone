'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Save, RefreshCw, Wand2, ClipboardCheck, Check } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import DocLinks from '@/components/ui/DocLinks'
import PermitTracker from '@/components/jobs/PermitTracker'
import JobTimeline from '@/components/jobs/JobTimeline'
import { fetchInspections } from '@/lib/api'

const TRADES = ['foundation', 'roofing', 'remodel', 'kitchen', 'concrete', 'framing', 'windows', 'siding', 'exterior', 'hvac', 'plumbing', 'electrical']
const STATUSES = ['lead', 'scheduled', 'inspected', 'quoted', 'sold', 'in_progress', 'complete', 'cancelled']

interface JobDetailOverlayProps {
  job: any
  onClose: () => void
  onSave?: (updated: any) => void
  saving?: boolean
}

function severityStyle(s: string) {
  if (s === 'HIGH') return 'text-[#b83232] bg-red-900/20 border-red-800/30'
  if (s === 'MED') return 'text-[#d4880a] bg-amber-900/20 border-amber-800/30'
  return 'text-[#606070] bg-[#151518] border-[#2a2a32]'
}

export default function JobDetailOverlay({ job, onClose, onSave, saving }: JobDetailOverlayProps) {
  const [tab, setTab] = useState<'details' | 'inspections' | 'permits' | 'timeline'>('details')
  const [form, setForm] = useState({
    status: job.status || 'lead',
    trade: job.trade || 'roofing',
    quoted_value: job.quoted_value || '',
    notes: job.notes || '',
    subcontractor: job.subcontractor?.company || '',
    matterport_url: job.matterport_url || '',
    onedrive_url: job.onedrive_url || '',
    rilla_url: job.rilla_url || '',
  })
  const [inspections, setInspections] = useState<any[]>([])
  const [loadingInspections, setLoadingInspections] = useState(false)

  useEffect(() => {
    if (tab === 'inspections' && job.id) {
      setLoadingInspections(true)
      fetchInspections(job.id)
        .then(setInspections)
        .catch(() => setInspections([]))
        .finally(() => setLoadingInspections(false))
    }
  }, [tab, job.id])

  const scoreColor = !job.rilla_score
    ? '#606070'
    : job.rilla_score >= 80
    ? '#3eb85a'
    : job.rilla_score >= 65
    ? '#d4880a'
    : '#b83232'

  const estimatorHref = `/estimator?trade=${form.trade}${job.id ? `&job_id=${job.id}` : ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end overlay-backdrop animate-fade-in">
      <div
        className="h-full w-full sm:w-[560px] bg-[#0f0f12] border-l border-[#2a2a32] overflow-y-auto flex flex-col animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32] sticky top-0 bg-[#0f0f12] z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-[#4a9de0]">{job.job_number}</span>
              <StatusPill type="status" value={form.status} />
            </div>
            <p className="font-body text-base font-semibold text-[#e8e8ee] mt-0.5">
              {job.customer?.name || 'Unknown Customer'}
            </p>
            <p className="font-nav text-xs text-[#606070]">
              {job.customer?.address}, {job.customer?.city}, {job.customer?.state}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={estimatorHref}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c8922a]/10 border border-[#c8922a]/30 rounded-md font-nav text-xs font-semibold text-[#e8aa40] hover:bg-[#c8922a]/20 transition-colors"
            >
              <Wand2 size={12} /> Build Quote
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a32] px-5 overflow-x-auto">
          {([ 'details', 'inspections', 'permits', 'timeline'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-1 mr-5 font-nav text-xs font-semibold tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                tab === t
                  ? 'border-[#c8922a] text-[#e8aa40]'
                  : 'border-transparent text-[#606070] hover:text-[#9090a0]'
              }`}
            >
              {t === 'inspections' ? 'INSPECTIONS' : t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div className="flex-1 p-5 space-y-5">
            {/* Documentation Links Panel */}
            <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
              <h3 className="font-display text-sm tracking-wider text-[#9090a0] mb-3">DOCUMENTATION</h3>
              <DocLinks
                matterport_url={form.matterport_url}
                onedrive_url={form.onedrive_url}
                rilla_url={form.rilla_url}
              />
              <div className="mt-3 space-y-2">
                {[
                  { key: 'matterport_url', label: 'Matterport 3D URL', placeholder: 'https://matterport.com/models/...' },
                  { key: 'onedrive_url', label: 'OneDrive / Video URL', placeholder: 'https://onedrive.com/...' },
                  { key: 'rilla_url', label: 'Rilla Call URL', placeholder: 'https://app.rilla.com/...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">{label}</label>
                    <input
                      type="url"
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-xs text-[#e8e8ee] placeholder-[#606070] input-gold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rilla Audit Summary */}
            {job.rilla_score && (
              <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
                <h3 className="font-display text-sm tracking-wider text-[#9090a0] mb-3">RILLA AUDIT</h3>
                <div className="flex items-start gap-4">
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: scoreColor, boxShadow: `0 0 12px ${scoreColor}30` }}
                    >
                      <span className="font-display text-xl" style={{ color: scoreColor }}>
                        {job.rilla_score}
                      </span>
                    </div>
                    <p className="font-nav text-[10px] text-[#606070] mt-1">SCORE</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="bg-[#0f0f12] rounded p-2">
                      <p className="font-mono text-xs text-[#4a9de0]">68%</p>
                      <p className="font-nav text-[10px] text-[#606070]">Talk Ratio</p>
                    </div>
                    <div className="bg-[#0f0f12] rounded p-2">
                      <p className="font-mono text-xs text-[#e8aa40]">4</p>
                      <p className="font-nav text-[10px] text-[#606070]">Open Questions</p>
                    </div>
                    <div className="bg-[#0f0f12] rounded p-2">
                      <p className="font-mono text-xs text-[#e8e8ee]">52 min</p>
                      <p className="font-nav text-[10px] text-[#606070]">Duration</p>
                    </div>
                    <div className="bg-[#0f0f12] rounded p-2">
                      <p className="font-mono text-xs text-[#3eb85a]">Quote Sent</p>
                      <p className="font-nav text-[10px] text-[#606070]">Outcome</p>
                    </div>
                  </div>
                </div>
                {form.rilla_url && (
                  <a
                    href={form.rilla_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 font-nav text-xs text-[#c8922a] hover:text-[#e8aa40]"
                  >
                    View Full Rilla Report <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}

            {/* Job Detail Form */}
            <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
              <h3 className="font-display text-sm tracking-wider text-[#9090a0] mb-3">JOB DETAILS</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Trade</label>
                  <select
                    value={form.trade}
                    onChange={(e) => setForm({ ...form, trade: e.target.value })}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold"
                  >
                    {TRADES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Quoted Value</label>
                  <input
                    type="number"
                    value={form.quoted_value}
                    onChange={(e) => setForm({ ...form, quoted_value: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] placeholder-[#606070] input-gold"
                  />
                </div>
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Subcontractor</label>
                  <input
                    type="text"
                    value={form.subcontractor}
                    onChange={(e) => setForm({ ...form, subcontractor: e.target.value })}
                    placeholder="Company name"
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Job notes, special instructions..."
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'inspections' && (
          <div className="flex-1 p-5">
            {loadingInspections ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#151518] rounded animate-pulse" />)}
              </div>
            ) : inspections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardCheck size={32} className="text-[#2a2a32] mb-3" />
                <p className="font-nav text-sm text-[#606070]">No inspections on record.</p>
                <a href="/inspect" className="font-nav text-xs text-[#c8922a] hover:text-[#e8aa40] mt-2">
                  Create Inspection Form →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {inspections.map((ins) => {
                  const items: any[] = ins.items || []
                  const done = items.filter((it: any) => it.checked).length
                  return (
                    <div key={ins.id} className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-display text-sm tracking-wider text-[#e8e8ee] capitalize">{ins.trade}</span>
                          <span className="font-nav text-xs text-[#606070] ml-2">· {ins.inspector_name}</span>
                        </div>
                        <span className="font-mono text-xs text-[#606070]">{ins.inspection_date}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-1.5 bg-[#0f0f12] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#3eb85a] transition-all"
                            style={{ width: `${items.length > 0 ? (done / items.length) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[#606070]">{done}/{items.length}</span>
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 5).map((it: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${it.checked ? 'bg-[#3eb85a]' : 'border border-[#2a2a32]'}`}>
                              {it.checked && <Check size={9} className="text-[#09090b]" />}
                            </div>
                            <span className={`font-body text-xs ${it.checked ? 'text-[#606070] line-through' : 'text-[#9090a0]'}`}>{it.label}</span>
                            <span className={`ml-auto flex-shrink-0 text-[9px] font-nav px-1.5 py-0.5 rounded border ${severityStyle(it.severity)}`}>{it.severity}</span>
                          </div>
                        ))}
                        {items.length > 5 && (
                          <p className="font-nav text-[10px] text-[#606070] pt-1">+{items.length - 5} more items</p>
                        )}
                      </div>
                      {ins.notes && (
                        <p className="font-body text-xs text-[#606070] mt-2 pt-2 border-t border-[#2a2a32]">{ins.notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'permits' && (
          <div className="flex-1 p-5">
            {job.id
              ? <PermitTracker jobId={job.id} />
              : <p className="font-nav text-sm text-[#606070]">Save the job first to track permits.</p>
            }
          </div>
        )}

        {tab === 'timeline' && (
          <div className="flex-1 p-5">
            {job.id
              ? <JobTimeline jobId={job.id} />
              : <p className="font-nav text-sm text-[#606070]">Save the job first to view timeline.</p>
            }
          </div>
        )}

        {/* Footer */}
        {tab === 'details' && (
          <div className="sticky bottom-0 px-5 py-3 bg-[#0f0f12] border-t border-[#2a2a32] flex gap-3">
            <button
              onClick={() => onSave?.(form)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors disabled:opacity-60"
            >
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-md font-nav text-sm text-[#9090a0] hover:text-[#e8e8ee] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Backdrop click */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
