'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, X, RefreshCw } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import DocLinks from '@/components/ui/DocLinks'
import JobDetailOverlay from '@/components/jobs/JobDetailOverlay'
import { fetchJobs, createJob, updateJob } from '@/lib/api'

const TRADE_FILTERS = ['all', 'foundation', 'roofing', 'remodel', 'kitchen', 'concrete', 'framing', 'windows', 'siding']
const STATUSES = ['lead', 'scheduled', 'inspected', 'quoted', 'sold', 'in_progress', 'complete', 'cancelled']
const TRADES = ['foundation', 'roofing', 'remodel', 'kitchen', 'concrete', 'framing', 'windows', 'siding', 'exterior', 'hvac', 'plumbing', 'electrical']

const BLANK_JOB = {
  customer_name: '', address: '', city: '', state: 'MA', trade: 'roofing',
  status: 'lead', subcontractor_name: '', quoted_value: '', notes: '',
  matterport_url: '', onedrive_url: '', rilla_url: '',
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [tradeFilter, setTradeFilter] = useState('all')
  const [showNewJob, setShowNewJob] = useState(false)
  const [newJob, setNewJob] = useState(BLANK_JOB)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setJobs(await fetchJobs())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = jobs.filter((j) => {
    const matchTrade = tradeFilter === 'all' || j.trade === tradeFilter
    const name = j.customer?.name || j.customer_name || ''
    const city = j.customer?.city || j.customer_city || ''
    const matchSearch = !search ||
      j.job_number?.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase())
    return matchTrade && matchSearch
  })

  const handleSave = async (updated: any) => {
    if (!selectedJob) return
    setSaving(true)
    try {
      const isRealId = selectedJob.id && !/^\d+$/.test(selectedJob.id)
      if (isRealId) {
        const saved = await updateJob(selectedJob.id, {
          status: updated.status,
          trade: updated.trade,
          quoted_value: updated.quoted_value ? parseFloat(updated.quoted_value) : null,
          notes: updated.notes,
          matterport_url: updated.matterport_url,
          onedrive_url: updated.onedrive_url,
          rilla_url: updated.rilla_url,
        })
        setJobs(jobs.map((j) => j.id === selectedJob.id ? { ...j, ...saved } : j))
      } else {
        setJobs(jobs.map((j) => j.id === selectedJob.id ? { ...j, ...updated } : j))
      }
    } catch (e: any) {
      alert(`Save failed: ${e.message}`)
    } finally {
      setSaving(false)
      setSelectedJob(null)
    }
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const payload = {
        customer_name: newJob.customer_name,
        address: newJob.address,
        city: newJob.city,
        state: newJob.state,
        trade: newJob.trade,
        status: newJob.status,
        quoted_value: newJob.quoted_value ? parseFloat(newJob.quoted_value) : null,
        notes: newJob.notes,
        matterport_url: newJob.matterport_url,
        onedrive_url: newJob.onedrive_url,
        rilla_url: newJob.rilla_url,
        audit_complete: false,
      }
      const created = await createJob(payload)
      setJobs([created, ...jobs])
      setShowNewJob(false)
      setNewJob(BLANK_JOB)
    } catch (e: any) {
      // Supabase not configured — add locally with temp id
      const tempJob = {
        id: `tmp-${Date.now()}`,
        job_number: `JOB-${(jobs.length + 1).toString().padStart(4, '0')}`,
        customer: { name: newJob.customer_name, address: newJob.address, city: newJob.city, state: newJob.state },
        customer_name: newJob.customer_name, customer_city: newJob.city, customer_state: newJob.state,
        trade: newJob.trade, status: newJob.status,
        subcontractor: newJob.subcontractor_name ? { company: newJob.subcontractor_name } : null,
        quoted_value: newJob.quoted_value ? parseFloat(newJob.quoted_value) : null,
        notes: newJob.notes, matterport_url: newJob.matterport_url,
        onedrive_url: newJob.onedrive_url, rilla_url: newJob.rilla_url,
        rilla_score: null, audit_complete: false,
      }
      setJobs([tempJob, ...jobs])
      setShowNewJob(false)
      setNewJob(BLANK_JOB)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">JOBS</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">{filtered.length} of {jobs.length} jobs</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowNewJob(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
              <Plus size={16} />
              <span className="hidden sm:inline">New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#2a2a32] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-9 pr-3 py-2 bg-[#151518] border border-[#2a2a32] rounded-md font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#606070]"><X size={12} /></button>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TRADE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTradeFilter(t)}
              className={`px-3 py-1.5 rounded font-nav text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                tradeFilter === t ? 'bg-[#c8922a] text-[#09090b]' : 'bg-[#151518] border border-[#2a2a32] text-[#9090a0] hover:text-[#e8e8ee]'
              }`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-[#151518] rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a32]">
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Job #</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Customer / Address</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Trade</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Subcontractor</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Status</th>
                <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Value</th>
                <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">Docs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} onClick={() => setSelectedJob(job)} className="border-b border-[#2a2a32]/50 table-row-hover">
                  <td className="px-4 py-3.5"><span className="font-mono text-xs text-[#4a9de0]">{job.job_number}</span></td>
                  <td className="px-4 py-3.5">
                    <p className="font-body text-sm text-[#e8e8ee]">{job.customer?.name || job.customer_name || '—'}</p>
                    <p className="font-nav text-[11px] text-[#606070]">
                      {job.customer?.address || job.address || ''}{job.customer?.city || job.customer_city ? `, ${job.customer?.city || job.customer_city}, ${job.customer?.state || job.customer_state}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3.5"><StatusPill type="trade" value={job.trade} /></td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="font-body text-sm text-[#9090a0]">
                      {job.subcontractor?.company || job.subcontractor_name || <span className="text-[#606070] italic">Unassigned</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><StatusPill type="status" value={job.status} /></td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className="font-mono text-sm text-[#e8e8ee]">
                      {job.quoted_value ? `$${Number(job.quoted_value).toLocaleString()}` : <span className="text-[#606070]">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <DocLinks matterport_url={job.matterport_url} onedrive_url={job.onedrive_url} rilla_url={job.rilla_url} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-nav text-sm text-[#606070]">No jobs match your filters.</p>
            </div>
          )}
        </div>
      )}

      {selectedJob && (
        <JobDetailOverlay job={selectedJob} onClose={() => setSelectedJob(null)} onSave={handleSave} saving={saving} />
      )}

      {/* New Job Overlay */}
      {showNewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop p-4">
          <div className="w-full max-w-lg bg-[#0f0f12] border border-[#2a2a32] rounded-lg overflow-y-auto max-h-[90vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32]">
              <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">NEW JOB</h2>
              <button onClick={() => setShowNewJob(false)} className="text-[#606070] hover:text-[#e8e8ee]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Trade</label>
                  <select value={newJob.trade} onChange={(e) => setNewJob({ ...newJob, trade: e.target.value })}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold">
                    {TRADES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Status</label>
                  <select value={newJob.status} onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold">
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Customer Name</label>
                <input type="text" value={newJob.customer_name} onChange={(e) => setNewJob({ ...newJob, customer_name: e.target.value })}
                  placeholder="e.g. Smith Residence"
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Address</label>
                  <input type="text" value={newJob.address} onChange={(e) => setNewJob({ ...newJob, address: e.target.value })}
                    placeholder="123 Main St"
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">State</label>
                  <select value={newJob.state} onChange={(e) => setNewJob({ ...newJob, state: e.target.value })}
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold">
                    {['MA','RI','CT','NH'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">City</label>
                  <input type="text" value={newJob.city} onChange={(e) => setNewJob({ ...newJob, city: e.target.value })}
                    placeholder="Boston"
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
                <div>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Quoted Value ($)</label>
                  <input type="number" value={newJob.quoted_value} onChange={(e) => setNewJob({ ...newJob, quoted_value: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
              </div>
              {['matterport_url', 'onedrive_url', 'rilla_url'].map((field) => (
                <div key={field}>
                  <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">
                    {field === 'matterport_url' ? 'Matterport URL' : field === 'onedrive_url' ? 'OneDrive / Video URL' : 'Rilla Call URL'}
                  </label>
                  <input type="url" value={(newJob as any)[field]} onChange={(e) => setNewJob({ ...newJob, [field]: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-xs text-[#e8e8ee] placeholder-[#606070] input-gold" />
                </div>
              ))}
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Notes</label>
                <textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                  rows={2} placeholder="Job notes..."
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold resize-none" />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors disabled:opacity-60">
                {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving...</> : 'Create Job'}
              </button>
              <button onClick={() => setShowNewJob(false)}
                className="px-4 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-md font-nav text-sm text-[#9090a0] hover:text-[#e8e8ee] transition-colors">
                Cancel
              </button>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setShowNewJob(false)} />
        </div>
      )}
    </div>
  )
}
