'use client'

import { useState, useEffect } from 'react'
import { Plus, AlertTriangle, RefreshCw, X, Archive, ArchiveRestore, Trash2, List, CalendarDays } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import { fetchSubs, fetchArchivedSubs, createSub, updateSub, archiveSub, unarchiveSub, deleteSub } from '@/lib/api'
import AvailabilityCalendar from '@/components/subs/AvailabilityCalendar'

const DOT: Record<string, string> = { available: '#3eb85a', busy: '#d4880a', unavailable: '#606070' }
const TRADES = ['foundation','roofing','remodel','kitchen','concrete','framing','windows','siding','exterior','hvac','plumbing','electrical']

function isExpiringSoon(dateStr: string) {
  if (!dateStr) return false
  return (new Date(dateStr).getTime() - Date.now()) / 86400000 < 90
}

const BLANK: Record<string, any> = {
  company: '', contact_name: '', trade: 'roofing', crew_size: 1,
  status: 'available', license_number: '', license_expiry: '',
  hourly_rate: '', phone: '', email: '', city: '', state: 'MA',
}

export default function SubsPage() {
  const [subs, setSubs]         = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [filter, setFilter]     = useState<string>('all')
  const [showNew, setShowNew]   = useState(false)
  const [form, setForm]         = useState<Record<string, any>>(BLANK)
  const [editId, setEditId]     = useState<string | null>(null)
  const [viewArchived, setViewArchived] = useState(false)
  const [view, setView]                 = useState<'list' | 'calendar'>('list')
  const [actionError, setActionError]   = useState<string | null>(null)
  const [confirming, setConfirming]     = useState<'archive' | 'delete' | null>(null)

  const load = async () => {
    setLoading(true)
    try { setSubs(viewArchived ? await fetchArchivedSubs() : await fetchSubs()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [viewArchived])

  const filtered = filter === 'all' ? subs : subs.filter((s) => s.status === filter)

  const handleSave = async () => {
    setSaving(true)
    setActionError(null)
    try {
      const payload = { ...form, crew_size: parseInt(form.crew_size) || 1, hourly_rate: parseFloat(form.hourly_rate) || 0 }
      if (editId) {
        const updated = await updateSub(editId, payload)
        setSubs(subs.map((s) => s.id === editId ? updated : s))
      } else {
        const created = await createSub(payload)
        setSubs([created, ...subs])
      }
      closeModal()
    } catch (e: any) {
      setActionError(e.message)
    } finally { setSaving(false) }
  }

  const handleArchive = async () => {
    if (!editId) return
    setSaving(true)
    setActionError(null)
    try {
      await archiveSub(editId)
      setSubs(subs.filter((s) => s.id !== editId))
      closeModal()
    } catch (e: any) {
      setActionError(e.message)
      setSaving(false)
    }
  }

  const handleUnarchive = async () => {
    if (!editId) return
    setSaving(true)
    setActionError(null)
    try {
      await unarchiveSub(editId)
      setSubs(subs.filter((s) => s.id !== editId))
      closeModal()
    } catch (e: any) {
      setActionError(e.message)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    setSaving(true)
    setActionError(null)
    try {
      await deleteSub(editId)
      setSubs(subs.filter((s) => s.id !== editId))
      closeModal()
    } catch (e: any) {
      setActionError(e.message)
      setSaving(false)
    }
  }

  const openEdit = (sub: any) => {
    setForm({ ...sub })
    setEditId(sub.id)
    setConfirming(null)
    setActionError(null)
    setShowNew(true)
  }

  const closeModal = () => {
    setShowNew(false)
    setEditId(null)
    setConfirming(null)
    setActionError(null)
    setForm(BLANK)
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">SUBCONTRACTORS</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">
              {viewArchived
                ? `${subs.length} archived`
                : `${subs.length} contractors · ${subs.filter((s) => s.status === 'available').length} active`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* List / Calendar toggle */}
            {!viewArchived && (
              <div className="flex items-center border border-[#2a2a32] rounded-md overflow-hidden">
                <button onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-nav text-xs transition-colors ${view === 'list' ? 'bg-[#c8922a] text-[#09090b]' : 'text-[#606070] hover:text-[#e8e8ee]'}`}>
                  <List size={13} />List
                </button>
                <button onClick={() => setView('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-nav text-xs transition-colors ${view === 'calendar' ? 'bg-[#c8922a] text-[#09090b]' : 'text-[#606070] hover:text-[#e8e8ee]'}`}>
                  <CalendarDays size={13} />Calendar
                </button>
              </div>
            )}
            <button onClick={() => { setViewArchived(!viewArchived); setFilter('all'); setView('list') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-nav text-xs font-semibold transition-colors border ${
                viewArchived
                  ? 'bg-[#c8922a]/10 border-[#c8922a]/30 text-[#c8922a]'
                  : 'bg-[#151518] border-[#2a2a32] text-[#606070] hover:text-[#e8e8ee]'
              }`}>
              <Archive size={13} />{viewArchived ? 'Active Subs' : 'Archived'}
            </button>
            <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518]">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            {!viewArchived && view === 'list' && (
              <button onClick={() => { setForm(BLANK); setEditId(null); setConfirming(null); setActionError(null); setShowNew(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
                <Plus size={16} /><span className="hidden sm:inline">Add Sub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {!viewArchived && view === 'calendar' && (
        <AvailabilityCalendar subs={subs} />
      )}

      {!viewArchived && view === 'list' && (
        <div className="px-6 py-3 border-b border-[#2a2a32] flex gap-2">
          {(['all','available','busy','unavailable'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-nav text-xs font-semibold uppercase tracking-wide transition-colors ${
                filter === s ? 'bg-[#c8922a] text-[#09090b]' : 'bg-[#151518] border border-[#2a2a32] text-[#9090a0] hover:text-[#e8e8ee]'
              }`}>
              {s !== 'all' && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DOT[s] }} />}
              {s === 'all' ? 'All' : s === 'available' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {!viewArchived && view === 'calendar' ? null : loading ? (
        <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[#151518] rounded animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center">
          <Archive size={32} className="text-[#2a2a32] mx-auto mb-3" />
          <p className="font-nav text-sm text-[#606070]">{viewArchived ? 'No archived subcontractors.' : 'No subcontractors found.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a32]">
                {['Company','Trade','Status','Crew','License','Rate','Contact',''].map((h, i) => (
                  <th key={i} className={`text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] ${
                    i === 2 ? '' : i >= 3 && i <= 3 ? 'hidden sm:table-cell text-right' : i === 4 || i === 6 ? 'hidden lg:table-cell' : i === 5 ? 'hidden md:table-cell text-right' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const expiring = isExpiringSoon(sub.license_expiry)
                return (
                  <tr key={sub.id} onClick={() => openEdit(sub)} className="border-b border-[#2a2a32]/50 table-row-hover">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {!viewArchived && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DOT[sub.status] }} />}
                        {viewArchived && <Archive size={12} className="text-[#606070] flex-shrink-0" />}
                        <div>
                          <p className="font-body text-sm text-[#e8e8ee]">{sub.company}</p>
                          <p className="font-nav text-[11px] text-[#606070]">{sub.contact_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><StatusPill type="trade" value={sub.trade} /></td>
                    <td className="px-4 py-3.5">
                      {viewArchived
                        ? <span className="font-nav text-xs text-[#606070]">Archived</span>
                        : <span className="font-nav text-xs font-semibold capitalize" style={{ color: DOT[sub.status] }}>{sub.status === 'available' ? 'Active' : sub.status}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                      <span className="font-mono text-sm text-[#9090a0]">{sub.crew_size}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        {expiring && <AlertTriangle size={12} className="text-[#d4880a]" />}
                        <div>
                          <p className="font-mono text-xs text-[#9090a0]">{sub.license_number}</p>
                          <p className={`font-nav text-[10px] ${expiring ? 'text-[#d4880a]' : 'text-[#606070]'}`}>Exp: {sub.license_expiry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="font-mono text-sm text-[#e8e8ee]">${sub.hourly_rate}/hr</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="font-body text-xs text-[#9090a0]">{sub.phone}</p>
                      <p className="font-nav text-[10px] text-[#606070]">{sub.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(sub) }}
                        className="font-nav text-xs text-[#606070] hover:text-[#c8922a] transition-colors">
                        {viewArchived ? 'View' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop p-4">
          <div className="w-full max-w-lg bg-[#0f0f12] border border-[#2a2a32] rounded-lg overflow-y-auto max-h-[90vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32]">
              <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">
                {viewArchived ? 'ARCHIVED SUB' : editId ? 'EDIT SUB' : 'ADD SUB'}
              </h2>
              <button onClick={closeModal} className="text-[#606070] hover:text-[#e8e8ee]"><X size={18} /></button>
            </div>

            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { key: 'company', label: 'Company Name', col: 2, type: 'text' },
                { key: 'contact_name', label: 'Contact Name', col: 1, type: 'text' },
                { key: 'phone', label: 'Phone', col: 1, type: 'text' },
                { key: 'email', label: 'Email', col: 2, type: 'email' },
                { key: 'city', label: 'City', col: 1, type: 'text' },
                { key: 'state', label: 'State', col: 1, type: 'text' },
                { key: 'license_number', label: 'License #', col: 1, type: 'text' },
                { key: 'license_expiry', label: 'License Expiry', col: 1, type: 'date' },
                { key: 'crew_size', label: 'Crew Size', col: 1, type: 'number' },
                { key: 'hourly_rate', label: 'Hourly Rate ($)', col: 1, type: 'number' },
              ].map(({ key, label, col, type }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    readOnly={viewArchived}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] input-gold read-only:opacity-60 read-only:cursor-default" />
                </div>
              ))}
              {!viewArchived && (
                <>
                  <div>
                    <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Trade</label>
                    <select value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })}
                      className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold">
                      {TRADES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold">
                      <option value="available">Active</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {actionError && (
              <div className="mx-5 mb-3 px-3 py-2 bg-[#b83232]/10 border border-[#b83232]/30 rounded">
                <p className="font-body text-xs text-[#b83232]">{actionError}</p>
              </div>
            )}

            {/* Confirm prompts */}
            {confirming === 'archive' && (
              <div className="mx-5 mb-3 px-3 py-3 bg-[#d4880a]/10 border border-[#d4880a]/30 rounded">
                <p className="font-body text-xs text-[#e8aa40] mb-2">Archive this subcontractor? They'll be hidden from the active list but their job history is preserved.</p>
                <div className="flex gap-2">
                  <button onClick={handleArchive} disabled={saving} className="px-3 py-1.5 bg-[#d4880a] hover:bg-[#e8aa40] text-[#09090b] rounded font-nav text-xs font-semibold disabled:opacity-60">
                    {saving ? 'Archiving…' : 'Yes, Archive'}
                  </button>
                  <button onClick={() => setConfirming(null)} className="px-3 py-1.5 border border-[#2a2a32] rounded font-nav text-xs text-[#9090a0]">Cancel</button>
                </div>
              </div>
            )}

            {confirming === 'delete' && (
              <div className="mx-5 mb-3 px-3 py-3 bg-[#b83232]/10 border border-[#b83232]/30 rounded">
                <p className="font-body text-xs text-[#e87070] mb-2">Permanently delete this subcontractor? This cannot be undone and may affect job records.</p>
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={saving} className="px-3 py-1.5 bg-[#b83232] hover:bg-[#d04040] text-white rounded font-nav text-xs font-semibold disabled:opacity-60">
                    {saving ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setConfirming(null)} className="px-3 py-1.5 border border-[#2a2a32] rounded font-nav text-xs text-[#9090a0]">Cancel</button>
                </div>
              </div>
            )}

            <div className="px-5 pb-5 flex gap-3 flex-wrap">
              {viewArchived ? (
                <>
                  <button onClick={handleUnarchive} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3eb85a] hover:bg-[#50d06a] text-[#09090b] rounded-md font-nav text-sm font-semibold transition-colors disabled:opacity-60">
                    <ArchiveRestore size={14} />{saving ? 'Restoring…' : 'Restore to Active'}
                  </button>
                  <button onClick={() => setConfirming('delete')} disabled={saving}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#151518] border border-[#b83232]/40 text-[#b83232] hover:bg-[#b83232]/10 rounded-md font-nav text-sm transition-colors disabled:opacity-60">
                    <Trash2 size={14} />Delete
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors disabled:opacity-60">
                    {saving ? <><RefreshCw size={13} className="animate-spin" />Saving…</> : (editId ? 'Update' : 'Add Subcontractor')}
                  </button>
                  {editId && (
                    <button onClick={() => setConfirming('archive')} disabled={saving}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#151518] border border-[#2a2a32] text-[#606070] hover:text-[#d4880a] hover:border-[#d4880a]/40 rounded-md font-nav text-sm transition-colors disabled:opacity-60">
                      <Archive size={14} />Archive
                    </button>
                  )}
                  <button onClick={closeModal}
                    className="px-4 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-md font-nav text-sm text-[#9090a0]">Cancel</button>
                </>
              )}
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={closeModal} />
        </div>
      )}
    </div>
  )
}
