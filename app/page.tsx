'use client'

import { useState } from 'react'
import { TrendingUp, Briefcase, FileText, ClipboardCheck, HardHat, Activity, ChevronRight } from 'lucide-react'
import StatBlock from '@/components/ui/StatBlock'
import StatusPill from '@/components/ui/StatusPill'
import DocLinks from '@/components/ui/DocLinks'
import JobDetailOverlay from '@/components/jobs/JobDetailOverlay'
import { MOCK_JOBS, MOCK_SUBS, PIPELINE_STAGES } from '@/lib/constants'

const PIPELINE_COUNTS: Record<string, number> = {
  lead: 3,
  scheduled: 4,
  inspected: 5,
  quoted: 7,
  sold: 4,
  in_progress: 6,
}
const TOTAL = Object.values(PIPELINE_COUNTS).reduce((a, b) => a + b, 0)

const ACTIVITY_FEED = [
  { id: 1, time: '2h ago', text: 'JOB-0003 marked Sold — Chen Remodel kitchen', type: 'sold' },
  { id: 2, time: '4h ago', text: 'Rilla score uploaded for JOB-0001 — 84/100', type: 'audit' },
  { id: 3, time: '5h ago', text: 'New quote sent: JOB-0002 Walsh Commercial ($42,000)', type: 'quote' },
  { id: 4, time: '8h ago', text: 'Matterport scan linked to JOB-0004 Kowalski Home', type: 'doc' },
  { id: 5, time: '1d ago', text: 'JOB-0005 Patel Properties scheduled for inspection', type: 'schedule' },
  { id: 6, time: '1d ago', text: 'New sub added: ClearView Windows — Carlos Diaz', type: 'sub' },
  { id: 7, time: '2d ago', text: 'JOB-0001 Rivera Residence moved to In Progress', type: 'status' },
]

const DOT_COLORS: Record<string, string> = {
  available: '#3eb85a',
  busy: '#d4880a',
  unavailable: '#606070',
}

export default function Dashboard() {
  const [selectedJob, setSelectedJob] = useState<any>(null)

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">DASHBOARD</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">Sunday, April 20, 2026 · New England Region</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#3eb85a]/10 border border-[#3eb85a]/20 rounded-md">
            <span className="w-2 h-2 rounded-full bg-[#3eb85a] status-dot-active" />
            <span className="font-nav text-xs font-semibold text-[#3eb85a]">6 ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatBlock label="Active Jobs" value="6" color="green" icon={<Briefcase size={14} />} />
          <StatBlock label="Pipeline Value" value="$284K" color="gold" icon={<TrendingUp size={14} />} />
          <StatBlock label="Quotes Out" value="7" color="blue" icon={<FileText size={14} />} />
          <StatBlock label="Audits Due" value="4" color="red" icon={<ClipboardCheck size={14} />} />
          <StatBlock label="Subs Active" value="4" color="default" icon={<HardHat size={14} />} />
        </div>

        {/* Pipeline Bar */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg tracking-wider text-[#e8e8ee]">PIPELINE</h2>
            <span className="font-mono text-xs text-[#606070]">{TOTAL} TOTAL</span>
          </div>
          <div className="flex rounded-md overflow-hidden h-8">
            {PIPELINE_STAGES.map((stage) => {
              const count = PIPELINE_COUNTS[stage.key] || 0
              const pct = (count / TOTAL) * 100
              return (
                <div
                  key={stage.key}
                  style={{ width: `${pct}%`, backgroundColor: stage.color }}
                  className="relative flex items-center justify-center group transition-all"
                  title={`${stage.label}: ${count}`}
                >
                  {pct > 8 && (
                    <span className="font-nav text-[10px] font-bold text-white/90 select-none">
                      {count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: stage.color }} />
                <span className="font-nav text-[11px] text-[#9090a0]">
                  {stage.label} <span className="text-[#606070]">({PIPELINE_COUNTS[stage.key]})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent Jobs Table */}
          <div className="xl:col-span-2 bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a32]">
              <h2 className="font-display text-base tracking-wider text-[#e8e8ee]">RECENT JOBS</h2>
              <a href="/jobs" className="flex items-center gap-1 font-nav text-xs text-[#c8922a] hover:text-[#e8aa40]">
                View all <ChevronRight size={12} />
              </a>
            </div>
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
                  {MOCK_JOBS.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="border-b border-[#2a2a32]/50 table-row-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[#4a9de0]">{job.job_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-body text-sm text-[#e8e8ee]">{job.customer.name}</p>
                          <p className="font-nav text-[11px] text-[#606070]">{job.customer.city}, {job.customer.state}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <StatusPill type="trade" value={job.trade} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill type="status" value={job.status} />
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="font-mono text-sm text-[#e8e8ee]">
                          {job.quoted_value ? `$${job.quoted_value.toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <DocLinks
                          matterport_url={job.matterport_url}
                          onedrive_url={job.onedrive_url}
                          rilla_url={job.rilla_url}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Activity Feed */}
            <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a32]">
                <Activity size={14} className="text-[#c8922a]" />
                <h2 className="font-display text-base tracking-wider text-[#e8e8ee]">ACTIVITY</h2>
              </div>
              <div className="divide-y divide-[#2a2a32]/50">
                {ACTIVITY_FEED.map((item) => (
                  <div key={item.id} className="px-4 py-2.5 flex gap-3">
                    <span className="font-mono text-[10px] text-[#606070] whitespace-nowrap mt-0.5">{item.time}</span>
                    <p className="font-body text-xs text-[#9090a0] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subs Availability */}
            <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2a32]">
                <h2 className="font-display text-base tracking-wider text-[#e8e8ee]">SUBS AVAILABILITY</h2>
              </div>
              <div className="divide-y divide-[#2a2a32]/50">
                {[
                  { company: 'Peak Roofing LLC', trade: 'roofing', status: 'available' },
                  { company: 'Deep Dig Foundation', trade: 'foundation', status: 'busy' },
                  { company: 'Premier Interiors', trade: 'remodel', status: 'available' },
                  { company: 'SolidForm Concrete', trade: 'concrete', status: 'available' },
                  { company: 'New England Frame Co.', trade: 'framing', status: 'unavailable' },
                  { company: 'ClearView Windows', trade: 'windows', status: 'busy' },
                ].map((sub) => (
                  <div key={sub.company} className="px-4 py-2.5 flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: DOT_COLORS[sub.status] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-[#e8e8ee] truncate">{sub.company}</p>
                      <p className="font-nav text-[10px] text-[#606070] capitalize">{sub.trade}</p>
                    </div>
                    <span className="font-nav text-[10px] capitalize" style={{ color: DOT_COLORS[sub.status] }}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobDetailOverlay job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}
