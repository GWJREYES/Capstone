'use client'

import { useState, useEffect } from 'react'
import { Plus, FileCheck, AlertTriangle, Trash2, ChevronDown } from 'lucide-react'
import { Permit } from '@/types'
import { fetchPermits, createPermit, updatePermit, deletePermit } from '@/lib/api'
import { PERMIT_STATUS_STYLES, PERMIT_STATUS_LABELS, PERMIT_TYPES } from '@/lib/constants'

const PERMIT_STATUSES = ['not_applied','pending','approved','active','inspection_due','closed','rejected'] as const

interface Props { jobId: string }

export default function PermitTracker({ jobId }: Props) {
  const [permits, setPermits]   = useState<Permit[]>([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({
    permit_type: 'Building',
    permit_number: '',
    status: 'not_applied' as Permit['status'],
    applied_date: '',
    approved_date: '',
    expiry_date: '',
    fee: '',
    issuing_authority: '',
    notes: '',
  })

  useEffect(() => {
    fetchPermits(jobId).then(setPermits).finally(() => setLoading(false))
  }, [jobId])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const created = await createPermit({
        job_id: jobId,
        ...form,
        fee: form.fee ? parseFloat(form.fee) : null,
        applied_date:  form.applied_date  || null,
        approved_date: form.approved_date || null,
        expiry_date:   form.expiry_date   || null,
      })
      setPermits((p) => [created, ...p])
      setAdding(false)
      setForm({ permit_type: 'Building', permit_number: '', status: 'not_applied', applied_date: '', approved_date: '', expiry_date: '', fee: '', issuing_authority: '', notes: '' })
    } catch {}
    setSaving(false)
  }

  const handleStatusChange = async (permit: Permit, status: Permit['status']) => {
    const updated = await updatePermit(permit.id, { status })
    if (updated) setPermits((p) => p.map((x) => x.id === permit.id ? { ...x, status } : x))
  }

  const handleDelete = async (id: string) => {
    await deletePermit(id)
    setPermits((p) => p.filter((x) => x.id !== id))
  }

  const hasWarning = permits.some((p) => p.status === 'inspection_due')

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck size={14} className="text-[#c8922a]" />
          <span className="font-display text-sm tracking-wider text-[#9090a0]">PERMITS</span>
          {hasWarning && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-900/30 border border-amber-800/40 font-nav text-[10px] text-[#d4880a]">
              <AlertTriangle size={10} /> Action Required
            </span>
          )}
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#151518] border border-[#2a2a32] hover:border-[#c8922a]/40 rounded-md font-nav text-xs text-[#9090a0] hover:text-[#e8e8ee] transition-colors"
        >
          <Plus size={12} /> Add Permit
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-[#0f0f12] border border-[#c8922a]/20 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Type</label>
              <select
                value={form.permit_type}
                onChange={(e) => setForm({ ...form, permit_type: e.target.value })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-nav text-xs text-[#e8e8ee] input-gold"
              >
                {PERMIT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Permit['status'] })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-nav text-xs text-[#e8e8ee] input-gold"
              >
                {PERMIT_STATUSES.map((s) => (
                  <option key={s} value={s}>{PERMIT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Permit #</label>
              <input type="text" value={form.permit_number} onChange={(e) => setForm({ ...form, permit_number: e.target.value })}
                placeholder="e.g. BP-2026-1042" className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Issuing Authority</label>
              <input type="text" value={form.issuing_authority} onChange={(e) => setForm({ ...form, issuing_authority: e.target.value })}
                placeholder="City / Town" className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-body text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Applied</label>
              <input type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Expiry</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] input-gold" />
            </div>
            <div>
              <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Fee ($)</label>
              <input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })}
                placeholder="0.00" className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold" />
            </div>
          </div>
          <div>
            <label className="font-nav text-[9px] uppercase tracking-wider text-[#606070] mb-1 block">Notes</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes" className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-body text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-md font-nav text-xs font-semibold transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Add Permit'}
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-[#151518] border border-[#2a2a32] text-[#9090a0] rounded-md font-nav text-xs transition-colors hover:text-[#e8e8ee]">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-[#151518] rounded animate-pulse" />)}
        </div>
      ) : permits.length === 0 ? (
        <div className="text-center py-8">
          <FileCheck size={24} className="text-[#2a2a32] mx-auto mb-2" />
          <p className="font-nav text-xs text-[#606070]">No permits added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {permits.map((permit) => (
            <div key={permit.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-lg group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-sm text-[#e8e8ee] font-medium">{permit.permit_type}</span>
                  {permit.permit_number && (
                    <span className="font-mono text-xs text-[#606070]">#{permit.permit_number}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {permit.issuing_authority && (
                    <span className="font-nav text-[10px] text-[#606070]">{permit.issuing_authority}</span>
                  )}
                  {permit.expiry_date && (
                    <span className="font-nav text-[10px] text-[#606070]">Exp: {permit.expiry_date}</span>
                  )}
                  {permit.fee != null && (
                    <span className="font-mono text-[10px] text-[#606070]">${permit.fee}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <select
                    value={permit.status}
                    onChange={(e) => handleStatusChange(permit, e.target.value as Permit['status'])}
                    className={`appearance-none pl-2 pr-6 py-1 rounded border font-nav text-[10px] font-semibold tracking-wide cursor-pointer ${PERMIT_STATUS_STYLES[permit.status]} bg-transparent`}
                  >
                    {PERMIT_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#151518] text-[#e8e8ee]">
                        {PERMIT_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                </div>
                <button onClick={() => handleDelete(permit.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#606070] hover:text-[#b83232] transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
