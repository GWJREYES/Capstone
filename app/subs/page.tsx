'use client'

import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import { MOCK_SUBS } from '@/lib/constants'

const DOT_COLORS: Record<string, string> = {
  available: '#3eb85a',
  busy: '#d4880a',
  unavailable: '#606070',
}

function isExpiringSoon(dateStr: string): boolean {
  const expiry = new Date(dateStr)
  const now = new Date()
  const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff < 90
}

export default function SubsPage() {
  const [subs] = useState(MOCK_SUBS)
  const [filter, setFilter] = useState<'all' | 'available' | 'busy' | 'unavailable'>('all')

  const filtered = filter === 'all' ? subs : subs.filter((s) => s.status === filter)

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">SUBCONTRACTORS</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">{subs.length} contractors · {subs.filter((s) => s.status === 'available').length} available</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
            <Plus size={16} />
            <span className="hidden sm:inline">Add Sub</span>
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="px-6 py-3 border-b border-[#2a2a32] flex gap-2">
        {(['all', 'available', 'busy', 'unavailable'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-nav text-xs font-semibold uppercase tracking-wide transition-colors ${
              filter === s
                ? 'bg-[#c8922a] text-[#09090b]'
                : 'bg-[#151518] border border-[#2a2a32] text-[#9090a0] hover:text-[#e8e8ee]'
            }`}
          >
            {s !== 'all' && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DOT_COLORS[s] }} />
            )}
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a32]">
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Company</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Trade</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Status</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Crew</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">License</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Rate</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden xl:table-cell">Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => {
              const expiring = isExpiringSoon(sub.license_expiry)
              return (
                <tr key={sub.id} className="border-b border-[#2a2a32]/50 table-row-hover">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: DOT_COLORS[sub.status] }}
                      />
                      <div>
                        <p className="font-body text-sm text-[#e8e8ee]">{sub.company}</p>
                        <p className="font-nav text-[11px] text-[#606070]">{sub.contact_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <StatusPill type="trade" value={sub.trade} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="font-nav text-xs font-semibold capitalize"
                      style={{ color: DOT_COLORS[sub.status] }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className="font-mono text-sm text-[#9090a0]">{sub.crew_size}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {expiring && (
                        <AlertTriangle size={12} className="text-[#d4880a]" />
                      )}
                      <div>
                        <p className="font-mono text-xs text-[#9090a0]">{sub.license_number}</p>
                        <p className={`font-nav text-[10px] ${expiring ? 'text-[#d4880a]' : 'text-[#606070]'}`}>
                          Exp: {sub.license_expiry}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="font-mono text-sm text-[#e8e8ee]">${sub.hourly_rate}/hr</span>
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <div>
                      <p className="font-body text-xs text-[#9090a0]">{sub.phone}</p>
                      <p className="font-nav text-[10px] text-[#606070]">{sub.email}</p>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
