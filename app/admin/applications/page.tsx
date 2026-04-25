'use client'

import { useState, useEffect } from 'react'
import { UserCheck, RefreshCw, Filter } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SubApplicationCard from '@/components/subs/SubApplicationCard'
import { SubApplication, SubApplicationStatus } from '@/types'
import { MOCK_APPLICATIONS } from '@/lib/constants'

const FILTERS: { label: string; value: SubApplicationStatus | 'all' }[] = [
  { label: 'Pending',  value: 'pending'  },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All',      value: 'all'      },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<SubApplication[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState<SubApplicationStatus | 'all'>('pending')
  const [error, setError]               = useState<string | null>(null)

  const load = async (status: SubApplicationStatus | 'all' = filter) => {
    setLoading(true)
    setError(null)
    try {
      const url = status === 'all' ? '/api/sub-applications' : `/api/sub-applications?status=${status}`
      const res  = await fetch(url)
      const data = await res.json()
      setApplications(Array.isArray(data) ? data : MOCK_APPLICATIONS as any)
    } catch {
      setApplications(MOCK_APPLICATIONS as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleApprove = async (id: string, note: string) => {
    const res = await fetch(`/api/sub-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', admin_note: note, reviewed_by: 'Justin' }),
    })
    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'approved', admin_note: note } : a)
      )
    }
  }

  const handleReject = async (id: string, note: string) => {
    const res = await fetch(`/api/sub-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', admin_note: note, reviewed_by: 'Justin' }),
    })
    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'rejected', admin_note: note } : a)
      )
    }
  }

  const pendingCount  = applications.filter((a) => a.status === 'pending').length
  const approvedCount = applications.filter((a) => a.status === 'approved').length

  const visible = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter)

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <PageHeader
        title="SUB APPLICATIONS"
        subtitle="Review and approve subcontractor applications"
        onRefresh={() => load()}
        loading={loading}
        actions={
          <a
            href="/sub-portal/register"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c8922a]/10 border border-[#c8922a]/30 rounded-md font-nav text-xs font-semibold text-[#e8aa40] hover:bg-[#c8922a]/20 transition-colors"
          >
            <UserCheck size={13} /> Portal Link
          </a>
        }
      />

      <div className="px-6 pb-6">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Pending Review', value: pendingCount,  color: 'text-[#d4880a]' },
            { label: 'Approved',       value: approvedCount, color: 'text-[#3eb85a]' },
            { label: 'Total',          value: applications.length, color: 'text-[#e8e8ee]' },
          ].map((s) => (
            <div key={s.label} className="bg-[#151518] border border-[#2a2a32] rounded-lg px-4 py-3 text-center">
              <p className={`font-display text-2xl ${s.color}`}>{s.value}</p>
              <p className="font-nav text-[10px] text-[#606070] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-[#2a2a32] pb-0">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 font-nav text-xs font-semibold tracking-wider border-b-2 transition-colors ${
                filter === f.value
                  ? 'border-[#c8922a] text-[#e8aa40]'
                  : 'border-transparent text-[#606070] hover:text-[#9090a0]'
              }`}
            >
              {f.label.toUpperCase()}
              {f.value === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#c8922a] text-[#09090b] font-mono text-[9px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#151518] border border-[#2a2a32] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserCheck size={36} className="text-[#2a2a32] mb-3" />
            <p className="font-display text-xl tracking-wider text-[#9090a0]">
              {filter === 'pending' ? 'NO PENDING APPLICATIONS' : 'NO APPLICATIONS'}
            </p>
            <p className="font-body text-sm text-[#606070] mt-1 max-w-sm">
              {filter === 'pending'
                ? 'Share the sub portal link with subcontractors to start receiving applications.'
                : 'Applications will appear here once subs sign up via the portal.'}
            </p>
            <a
              href="/sub-portal/register"
              className="mt-4 font-nav text-sm text-[#c8922a] hover:text-[#e8aa40] transition-colors"
            >
              Sub Portal Registration →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((app) => (
              <SubApplicationCard
                key={app.id}
                application={app}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
