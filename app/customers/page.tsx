'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, X, RefreshCw, Archive, RotateCcw } from 'lucide-react'
import { fetchCustomers, fetchArchivedCustomers, createCustomer, updateCustomer, archiveCustomer, unarchiveCustomer } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = { active: '#3eb85a', inactive: '#606070', prospect: '#4a9de0' }
const BLANK = { name: '', address: '', city: '', state: 'MA', zip: '', phone: '', email: '', status: 'prospect' }

function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [archived, setArchived] = useState<any[]>([])
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Record<string, any>>(BLANK)
  const [editId, setEditId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [active, arch] = await Promise.all([fetchCustomers(), fetchArchivedCustomers()])
      setCustomers(active)
      setArchived(arch)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const list = tab === 'active' ? customers : archived
  const filtered = list.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editId) {
        const isReal = !/^\d+$/.test(editId)
        if (isReal) {
          const updated = await updateCustomer(editId, form)
          setCustomers(customers.map((c) => c.id === editId ? updated : c))
        } else {
          setCustomers(customers.map((c) => c.id === editId ? { ...c, ...form } : c))
        }
      } else {
        try {
          const created = await createCustomer(form)
          setCustomers([created, ...customers])
        } catch {
          setCustomers([{ id: `tmp-${Date.now()}`, ...form, jobs_count: 0, lifetime_value: 0 }, ...customers])
        }
      }
      setShowForm(false); setForm(BLANK); setEditId(null)
    } finally { setSaving(false) }
  }

  const handleArchive = async (c: any) => {
    setArchivingId(c.id)
    try {
      await archiveCustomer(c.id)
      setCustomers(customers.filter((x) => x.id !== c.id))
      setArchived([{ ...c, archived: true, archived_at: new Date().toISOString() }, ...archived])
    } catch (e: any) {
      alert(`Archive failed: ${e.message}`)
    } finally { setArchivingId(null) }
  }

  const handleRestore = async (c: any) => {
    setArchivingId(c.id)
    try {
      const restored = await unarchiveCustomer(c.id)
      setArchived(archived.filter((x) => x.id !== c.id))
      setCustomers([...customers, restored].sort((a, b) => a.name.localeCompare(b.name)))
    } catch (e: any) {
      alert(`Restore failed: ${e.message}`)
    } finally { setArchivingId(null) }
  }

  const openEdit = (c: any) => { setForm({ ...c }); setEditId(c.id); setShowForm(true) }
  const fmt = (n: number) => `$${(n || 0).toLocaleString()}`

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">CUSTOMERS</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">
              {customers.length} active · {archived.length} archived · {fmt(customers.reduce((s, c) => s + (c.lifetime_value || 0), 0))} LTV
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518]">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            {tab === 'active' && (
              <button onClick={() => { setForm(BLANK); setEditId(null); setShowForm(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
                <Plus size={16} /><span className="hidden sm:inline">Add Customer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="px-6 py-3 border-b border-[#2a2a32] flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-[#0f0f12] border border-[#2a2a32] p-1 rounded-lg">
          <button onClick={() => setTab('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-nav text-xs font-semibold tracking-wide transition-all ${
              tab === 'active' ? 'bg-[#c8922a] text-[#09090b]' : 'text-[#9090a0] hover:text-[#e8e8ee]'
            }`}>
            Active
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${tab === 'active' ? 'bg-[#09090b]/30' : 'bg-[#2a2a32]'}`}>{customers.length}</span>
          </button>
          <button onClick={() => setTab('archived')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-nav text-xs font-semibold tracking-wide transition-all ${
              tab === 'archived' ? 'bg-[#606070] text-[#e8e8ee]' : 'text-[#9090a0] hover:text-[#e8e8ee]'
            }`}>
            <Archive size={11} />
            Archived
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${tab === 'archived' ? 'bg-[#09090b]/20' : 'bg-[#2a2a32]'}`}>{archived.length}</span>
          </button>
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab} customers...`}
            className="w-full pl-9 pr-8 py-2 bg-[#151518] border border-[#2a2a32] rounded-md font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#606070]"><X size={12} /></button>}
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[#151518] rounded animate-pulse" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a32]">
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Name</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">Phone</th>
                <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Jobs</th>
                <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">LTV</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">
                  {tab === 'active' ? 'Status' : 'Archived On'}
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}
                  onClick={() => tab === 'active' && openEdit(c)}
                  className={`border-b border-[#2a2a32]/50 ${tab === 'active' ? 'table-row-hover' : 'cursor-default opacity-70'}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-body text-sm text-[#e8e8ee]">{c.name}</p>
                    <p className="font-nav text-[11px] text-[#606070]">{c.email}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="font-body text-sm text-[#9090a0]">{c.city}, {c.state} {c.zip}</p>
                    <p className="font-nav text-[11px] text-[#606070]">{c.address}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell"><span className="font-mono text-sm text-[#9090a0]">{c.phone}</span></td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell"><span className="font-mono text-sm text-[#4a9de0]">{c.jobs_count || 0}</span></td>
                  <td className="px-4 py-3.5 text-right"><span className="font-mono text-sm text-[#e8aa40]">{fmt(c.lifetime_value)}</span></td>
                  <td className="px-4 py-3.5">
                    {tab === 'active' ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[c.status] }} />
                        <span className="font-nav text-xs capitalize" style={{ color: STATUS_COLORS[c.status] }}>{c.status}</span>
                      </div>
                    ) : (
                      <span className="font-nav text-xs text-[#606070]">{fmtDate(c.archived_at)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    {tab === 'active' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(c)} className="font-nav text-xs text-[#606070] hover:text-[#c8922a] transition-colors">Edit</button>
                        <button
                          onClick={() => handleArchive(c)}
                          disabled={archivingId === c.id}
                          className="font-nav text-xs text-[#606070] hover:text-[#9090a0] transition-colors flex items-center gap-1 disabled:opacity-40">
                          {archivingId === c.id ? <RefreshCw size={10} className="animate-spin" /> : <Archive size={10} />}
                          Archive
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRestore(c)}
                        disabled={archivingId === c.id}
                        className="font-nav text-xs text-[#4a9de0] hover:text-[#5ab0f5] transition-colors flex items-center gap-1 disabled:opacity-40">
                        {archivingId === c.id ? <RefreshCw size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 font-nav text-sm text-[#606070]">
              {tab === 'archived' ? 'No archived customers.' : 'No customers found.'}
            </p>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop p-4">
          <div className="w-full max-w-lg bg-[#0f0f12] border border-[#2a2a32] rounded-lg overflow-y-auto max-h-[90vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32]">
              <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">{editId ? 'EDIT CUSTOMER' : 'NEW CUSTOMER'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-[#606070] hover:text-[#e8e8ee]"><X size={18} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Name', col: 2 }, { key: 'email', label: 'Email', col: 2 },
                { key: 'phone', label: 'Phone', col: 1 }, { key: 'address', label: 'Address', col: 1 },
                { key: 'city', label: 'City', col: 1 }, { key: 'state', label: 'State', col: 1 },
                { key: 'zip', label: 'ZIP', col: 1 },
              ].map(({ key, label, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">{label}</label>
                  <input type="text" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] input-gold" />
                </div>
              ))}
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold">
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors disabled:opacity-60">
                {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving...</> : (editId ? 'Update' : 'Add Customer')}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-md font-nav text-sm text-[#9090a0]">Cancel</button>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => { setShowForm(false); setEditId(null) }} />
        </div>
      )}
    </div>
  )
}
