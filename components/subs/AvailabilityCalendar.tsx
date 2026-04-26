'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface Props {
  subs: any[]
}

const STATUS_COLORS: Record<string, string> = {
  available:   'bg-[#3eb85a]/20 text-[#3eb85a] border-[#3eb85a]/40',
  busy:        'bg-[#d4880a]/20 text-[#d4880a] border-[#d4880a]/40',
  unavailable: 'bg-[#3a3a48]/60 text-[#606070] border-[#3a3a48]',
}

const STATUS_LABEL: Record<string, string> = {
  available:   'A',
  busy:        'B',
  unavailable: 'U',
}

function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AvailabilityCalendar({ subs }: Props) {
  const today   = new Date()
  const [current, setCurrent]       = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [data, setData]             = useState<any[]>([])
  const [loading, setLoading]       = useState(false)

  const year       = current.getFullYear()
  const month      = current.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthKey   = toMonthKey(current)
  const monthName  = current.toLocaleString('default', { month: 'long', year: 'numeric' })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/sub-availability?month=${monthKey}`)
        const json = await res.json()
        setData(Array.isArray(json) ? json : [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [monthKey])

  // Build lookup: sub_id + date -> status
  const lookup: Record<string, string> = {}
  data.forEach((e) => { lookup[`${e.sub_id}:${e.date}`] = e.status })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const dateStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  if (subs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-nav text-sm text-[#606070]">No subcontractors to display.</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="p-1.5 rounded hover:bg-[#2a2a32] text-[#606070]">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display text-base tracking-wider text-[#e8e8ee] w-44 text-center">{monthName}</span>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="p-1.5 rounded hover:bg-[#2a2a32] text-[#606070]">
            <ChevronRight size={16} />
          </button>
          {loading && <RefreshCw size={13} className="text-[#606070] animate-spin ml-1" />}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-nav text-[#606070]">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border bg-[#3eb85a]/20 border-[#3eb85a]/40 inline-flex items-center justify-center text-[#3eb85a] font-bold text-[9px]">A</span> Available</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border bg-[#d4880a]/20 border-[#d4880a]/40 inline-flex items-center justify-center text-[#d4880a] font-bold text-[9px]">B</span> Busy</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border bg-[#3a3a48]/60 border-[#3a3a48] inline-flex items-center justify-center text-[#606070] font-bold text-[9px]">U</span> Unavailable</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 font-nav text-[10px] uppercase tracking-wider text-[#606070] bg-[#0f0f12] border border-[#2a2a32] min-w-[120px] sticky left-0 z-10">
                Subcontractor
              </th>
              {days.map((d) => {
                const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year
                const dow = new Date(year, month, d).getDay()
                const isWeekend = dow === 0 || dow === 6
                return (
                  <th key={d} className={`px-1 py-2 font-mono text-[10px] text-center border border-[#2a2a32] min-w-[28px] ${isToday ? 'bg-[#c8922a]/20 text-[#c8922a]' : isWeekend ? 'bg-[#0f0f12] text-[#3a3a48]' : 'bg-[#0f0f12] text-[#606070]'}`}>
                    {d}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => (
              <tr key={sub.id} className="hover:bg-[#151518]/50">
                <td className="px-3 py-2 border border-[#2a2a32] bg-[#0f0f12] sticky left-0 z-10">
                  <p className="font-body text-sm text-[#e8e8ee] truncate max-w-[110px]">{sub.company}</p>
                  <p className="font-nav text-[10px] text-[#606070] capitalize">{sub.trade}</p>
                </td>
                {days.map((d) => {
                  const key    = `${sub.id}:${dateStr(d)}`
                  const status = lookup[key]
                  const dow    = new Date(year, month, d).getDay()
                  const isWeekend = dow === 0 || dow === 6
                  return (
                    <td key={d} className={`border border-[#2a2a32] p-0.5 text-center ${isWeekend ? 'bg-[#0a0a0e]' : ''}`}>
                      {status ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold border ${STATUS_COLORS[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      ) : (
                        <span className="inline-block w-5 h-5" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
