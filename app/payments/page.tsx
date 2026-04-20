'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, CheckCircle, Clock, AlertCircle, RefreshCw, Check } from 'lucide-react'
import { fetchPayments, markPaymentPaid } from '@/lib/api'

const STATUS_CFG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock size={12} />, color: 'text-[#4a9de0]', label: 'Pending' },
  paid: { icon: <CheckCircle size={12} />, color: 'text-[#3eb85a]', label: 'Paid' },
  overdue: { icon: <AlertCircle size={12} />, color: 'text-[#b83232]', label: 'Overdue' },
  partial: { icon: <Clock size={12} />, color: 'text-[#d4880a]', label: 'Partial' },
}

const STRIPE_STEPS = [
  { n: 1, title: 'Create Stripe Account', desc: 'Sign up at stripe.com and complete business verification for contractor payments.' },
  { n: 2, title: 'Add API Keys', desc: 'Copy your Publishable and Secret keys from the Stripe Dashboard into .env.local.' },
  { n: 3, title: 'Connect Payments', desc: 'Stripe integration will activate payment links, invoices, and ACH transfers.' },
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const stripeConfigured = !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('your_stripe')
  )

  const load = async () => {
    setLoading(true)
    try { setPayments(await fetchPayments()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id)
    try {
      setPayments(payments.map((p) => p.id === id ? { ...p, status: 'paid', paid_date: new Date().toISOString().split('T')[0] } : p))
      const isReal = !/^\d+$/.test(id)
      if (isReal) await markPaymentPaid(id)
    } finally { setMarkingId(null) }
  }

  const fmt = (n: number) => `$${(n || 0).toLocaleString()}`
  const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)
  const collected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">PAYMENTS</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">Invoice tracking and Stripe integration</p>
          </div>
          <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518]">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#151518] border border-[#4a9de0]/20 rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-[#4a9de0]">{fmt(pending)}</p>
            <p className="font-nav text-[11px] text-[#606070] mt-1">Pending</p>
          </div>
          <div className="bg-[#151518] border border-[#b83232]/20 rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-[#b83232]">{fmt(overdue)}</p>
            <p className="font-nav text-[11px] text-[#606070] mt-1">Overdue</p>
          </div>
          <div className="bg-[#151518] border border-[#3eb85a]/20 rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-[#3eb85a]">{fmt(collected)}</p>
            <p className="font-nav text-[11px] text-[#606070] mt-1">Collected</p>
          </div>
        </div>

        {!stripeConfigured && (
          <div className="bg-[#151518] border border-[#c8922a]/20 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#c8922a]/10 border border-[#c8922a]/20 flex items-center justify-center">
                <CreditCard size={16} className="text-[#c8922a]" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wider text-[#e8e8ee]">CONNECT STRIPE</h3>
                <p className="font-nav text-xs text-[#606070]">Accept payments online from customers</p>
              </div>
            </div>
            <div className="space-y-3">
              {STRIPE_STEPS.map((step) => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#c8922a]/10 border border-[#c8922a]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-display text-xs text-[#e8aa40]">{step.n}</span>
                  </div>
                  <div>
                    <p className="font-nav text-sm font-semibold text-[#e8e8ee]">{step.title}</p>
                    <p className="font-body text-xs text-[#9090a0]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
              Get Started with Stripe <ExternalLink size={13} />
            </a>
          </div>
        )}

        <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a32]">
            <h3 className="font-display text-base tracking-wider text-[#e8e8ee]">PAYMENT RECORDS</h3>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#0f0f12] rounded animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a32]">
                    <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Customer</th>
                    <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Job</th>
                    <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">Description</th>
                    <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Amount</th>
                    <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Due</th>
                    <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Status</th>
                    <th className="px-4 py-3 hidden sm:table-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const cfg = STATUS_CFG[p.status] || STATUS_CFG.pending
                    return (
                      <tr key={p.id} className="border-b border-[#2a2a32]/50">
                        <td className="px-4 py-3.5">
                          <span className="font-body text-sm text-[#e8e8ee]">{p.customer?.name || p.customer_name || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="font-mono text-xs text-[#4a9de0]">{p.job?.job_number || p.job_number || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="font-body text-sm text-[#9090a0]">{p.description}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-mono text-sm text-[#e8e8ee]">{fmt(p.amount)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className={`font-mono text-xs ${p.status === 'overdue' ? 'text-[#b83232]' : 'text-[#606070]'}`}>{p.due_date}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                            {cfg.icon}
                            <span className="font-nav text-xs font-semibold">{cfg.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-right">
                          {p.status !== 'paid' && (
                            <button onClick={() => handleMarkPaid(p.id)} disabled={markingId === p.id}
                              className="inline-flex items-center gap-1 font-nav text-xs text-[#c8922a] hover:text-[#e8aa40] transition-colors disabled:opacity-50">
                              {markingId === p.id ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {payments.length === 0 && <p className="text-center py-10 font-nav text-sm text-[#606070]">No payment records.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
