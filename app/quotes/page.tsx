'use client'

import { useState } from 'react'
import { Plus, X, FileText } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'

const MOCK_QUOTES = [
  { id: '1', quote_number: 'QT-2026-001', customer: 'Rivera Residence', trade: 'roofing', status: 'signed', total: 18500, margin: 26.8, created_at: '2026-04-10', updated_at: '2026-04-15' },
  { id: '2', quote_number: 'QT-2026-002', customer: 'Walsh Commercial', trade: 'foundation', status: 'awaiting_signature', total: 42000, margin: 28.6, created_at: '2026-04-12', updated_at: '2026-04-18' },
  { id: '3', quote_number: 'QT-2026-003', customer: 'Chen Remodel', trade: 'kitchen', status: 'sent', total: 29800, margin: 30.1, created_at: '2026-04-14', updated_at: '2026-04-16' },
  { id: '4', quote_number: 'QT-2026-004', customer: 'Kowalski Home', trade: 'siding', status: 'draft', total: 9800, margin: 27.5, created_at: '2026-04-17', updated_at: '2026-04-17' },
  { id: '5', quote_number: 'QT-2026-005', customer: 'Patel Properties', trade: 'concrete', status: 'declined', total: 11200, margin: 29.4, created_at: '2026-03-20', updated_at: '2026-04-01' },
  { id: '6', quote_number: 'QT-2026-006', customer: 'Torres Framing LLC', trade: 'framing', status: 'sent', total: 33600, margin: 26.3, created_at: '2026-04-18', updated_at: '2026-04-18' },
]

export default function QuotesPage() {
  const [quotes] = useState(MOCK_QUOTES)
  const [showNew, setShowNew] = useState(false)

  const fmt = (n: number) => `$${n.toLocaleString()}`

  const totals = {
    total: quotes.reduce((s, q) => s + q.total, 0),
    signed: quotes.filter((q) => q.status === 'signed').reduce((s, q) => s + q.total, 0),
    pending: quotes.filter((q) => ['sent', 'awaiting_signature'].includes(q.status)).reduce((s, q) => s + q.total, 0),
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">QUOTES</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">{quotes.length} quotes · {fmt(totals.total)} total value</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Quote</span>
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 p-4 lg:px-6 border-b border-[#2a2a32]">
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-3 text-center">
          <p className="font-display text-xl text-[#3eb85a]">{fmt(totals.signed)}</p>
          <p className="font-nav text-[10px] text-[#606070] mt-0.5">Signed</p>
        </div>
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-3 text-center">
          <p className="font-display text-xl text-[#4a9de0]">{fmt(totals.pending)}</p>
          <p className="font-nav text-[10px] text-[#606070] mt-0.5">Pending</p>
        </div>
        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-3 text-center">
          <p className="font-display text-xl text-[#e8aa40]">{fmt(totals.total)}</p>
          <p className="font-nav text-[10px] text-[#606070] mt-0.5">All Quotes</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a32]">
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Quote #</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Customer</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Trade</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Status</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Total</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Margin</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-[#2a2a32]/50 table-row-hover">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-[#4a9de0]" />
                    <span className="font-mono text-xs text-[#4a9de0]">{q.quote_number}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-body text-sm text-[#e8e8ee]">{q.customer}</span>
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <StatusPill type="trade" value={q.trade} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusPill type="status" value={q.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="font-mono text-sm text-[#e8e8ee]">{fmt(q.total)}</span>
                </td>
                <td className="px-4 py-3.5 text-right hidden md:table-cell">
                  <span className="font-mono text-sm text-[#3eb85a]">{q.margin.toFixed(1)}%</span>
                </td>
                <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                  <span className="font-mono text-xs text-[#606070]">{q.created_at}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop p-4">
          <div className="w-full max-w-md bg-[#0f0f12] border border-[#2a2a32] rounded-lg p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">NEW QUOTE</h2>
              <button onClick={() => setShowNew(false)} className="text-[#606070] hover:text-[#e8e8ee]"><X size={18} /></button>
            </div>
            <p className="font-body text-sm text-[#9090a0] mb-4">
              Use the AI Estimator to build a detailed quote, then save it here. Manual quote creation coming soon.
            </p>
            <div className="flex gap-3">
              <a href="/estimator"
                className="flex-1 text-center px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
                Go to Estimator
              </a>
              <button onClick={() => setShowNew(false)}
                className="px-4 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-md font-nav text-sm text-[#9090a0]">
                Cancel
              </button>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setShowNew(false)} />
        </div>
      )}
    </div>
  )
}
