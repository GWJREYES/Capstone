'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, HardHat, RefreshCw, AlertTriangle } from 'lucide-react'
import StatusPill from '@/components/ui/StatusPill'
import DailyUpdateForm from '@/components/jobs/DailyUpdateForm'
import { Job } from '@/types'

export default function SubPortalJobDetail() {
  const { subId, jobId } = useParams<{ subId: string; jobId: string }>()
  const [job, setJob]       = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`/api/jobs/${jobId}`)
        const data = await res.json()
        if (!data || data.error) { setNotFound(true); return }
        setJob(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <RefreshCw size={24} className="text-[#c8922a] animate-spin" />
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle size={36} className="text-[#b83232] mb-3" />
        <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">JOB NOT FOUND</h2>
        <a href={`/sub-portal/${subId}`} className="mt-4 font-nav text-sm text-[#c8922a] hover:text-[#e8aa40]">
          ← Back to Dashboard
        </a>
      </div>
    )
  }

  const customer = job.customer as any

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Portal header */}
      <div className="bg-[#0c1221] border-b border-[#1a2844] px-4 py-3 flex items-center gap-3">
        <a href={`/sub-portal/${subId}`} className="p-1.5 rounded-md text-[#606070] hover:text-[#e8e8ee] transition-colors">
          <ArrowLeft size={18} />
        </a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capstone" className="h-10 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Job header card */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-[#4a9de0]">{job.job_number}</span>
                <StatusPill type="status" value={job.status} />
              </div>
              <h2 className="font-body text-lg font-semibold text-[#e8e8ee]">
                {customer?.name ?? 'Unknown Customer'}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c8922a]/20 to-[#c8922a]/5 border border-[#c8922a]/20 flex items-center justify-center flex-shrink-0">
              <HardHat size={18} className="text-[#c8922a]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-[#606070] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-nav text-[9px] uppercase tracking-wider text-[#3a3a48]">Site Address</p>
                <p className="font-body text-xs text-[#9090a0]">
                  {job.address}<br />{job.city}, {job.state}
                </p>
              </div>
            </div>
            <div>
              <p className="font-nav text-[9px] uppercase tracking-wider text-[#3a3a48]">Trade</p>
              <p className="font-body text-xs text-[#9090a0] capitalize mt-0.5">{job.trade}</p>
            </div>
            {job.notes && (
              <div className="col-span-2 pt-3 border-t border-[#2a2a32]">
                <p className="font-nav text-[9px] uppercase tracking-wider text-[#3a3a48] mb-1">Job Notes</p>
                <p className="font-body text-xs text-[#9090a0] leading-relaxed">{job.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Update form + history */}
        <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-4">
          <DailyUpdateForm
            jobId={jobId}
            subId={subId}
            subCompany={job.subcontractor?.company}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  )
}
