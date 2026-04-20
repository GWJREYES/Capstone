'use client'

import { useState, useEffect } from 'react'
import { FileText, RefreshCw, X, Trash2 } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import { fetchQuotes, updateQuote, deleteQuote } from '@/lib/api'

const STATUS_ORDER = ['draft', 'sent', 'awaiting_signature', 'signed', 'declined']

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')

  const load = async () => {
    setLoading(true)
    try { setQuotes(await fetchQuotes()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleStatusChange = async (id: string, status: string) => {
    setQuotes(quotes.map((q) => q.id === id ? { ...q, status } : q))
    setEditId(null)
    const isReal = !/^\d+$/.test(id)
    if (isReal) {
      try { await updateQuote(id, { status }) } catch { /* offline */ }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quote?')) return
    setQuotes(quotes.filter((q) => q.id !== id))
    const isReal = !/^\d+$/.test(id)
    if (isReal) { try { await deleteQuote(id) } catch { /* offline */ } }
  }

  const fmt = (n: number) => `$${(n || 0).toLocaleString()}`
  const totals = {
    signed: quotes.filter((q) => q.status === 'signed').reduce((s, q) => s + q.total, 0),
    pending: quotes.filter((q) => ['sent', 'awaiting_signature'].includes(q.status)).reduce((s, q) => s + q.total, 0),
    all: quotes.reduce((s, q) => s + q.total, 0),
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">QUOTES</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">{quotes.length} quotes · {fmt(totals.all)} total</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518]">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <a href="/estimator"
              className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
              + New Quote
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 lg:px-6 border-b border-[#2a2a32]">
        <div className="bg-[#151518] border border-[#3eb85a]/20 rounded-lg p-3 text-center">
          <p className="font-display text-xl text-[#3eb85a]">{fmt(totals.signed)}</p>
          <p className="font-nav text-[10px] text-[#606070] mt-0.5">Signed</p>
        </div>
        <div className="bg-[#151518] border border-[#4a9de0]/20 rounded-lg p-3 text-center">
          <p className="font-display text-xl text-[#4a9de0]">{fmt(totals.pending)}</p>
          <p className="font-nav text-[10px] text-[#606070] mt-0.5">Pending</p>
        </div>
        <div className="bg-[#151518] border border-[#c8922a]/20 rounded-lg p-3 text-center">
          <p className="font-display text-xl text-[#e8aa40]">{fmt(totals.all)}</p>
          <p className="font-nav text-[10px] text-[#606070] mt-0.5">All Quotes</p>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[#151518] rounded animate-pulse" />)}</div>
      ) : (
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b border-[#2a2a32]/50 hover:bg-[#151518]/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-[#4a9de0]" />
                      <span className="font-mono text-xs text-[#4a9de0]">{q.quote_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-body text-sm text-[#e8e8ee]">{q.customer?.name || q.customer_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell"><StatusPill type="trade" value={q.trade} /></td>
                  <td className="px-4 py-3.5">
                    {editId === q.id ? (
                      <select autoFocus value={editStatus}
                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                        onBlur={() => setEditId(null)}
                        className="bg-[#0f0f12] border border-[#c8922a]/40 rounded px-2 py-1 font-nav text-xs text-[#e8e8ee] input-gold">
                        {STATUS_ORDER.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => { setEditId(q.id); setEditStatus(q.status) }}>
                        <StatusPill type="status" value={q.status} />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right"><span className="font-mono text-sm text-[#e8e8ee]">{fmt(q.total)}</span></td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="font-mono text-sm text-[#3eb85a]">{(q.margin || 0).toFixed(1)}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                    <span className="font-mono text-xs text-[#606070]">{q.created_at?.split('T')[0] || q.created_at}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => handleDelete(q.id)} className="p-1 text-[#606070] hover:text-[#b83232] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotes.length === 0 && (
            <div className="text-center py-16">
              <p className="font-nav text-sm text-[#606070]">No quotes yet.</p>
              <a href="/estimator" className="font-nav text-sm text-[#c8922a] hover:text-[#e8aa40] mt-1 inline-block">Build one in the AI Estimator →</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
