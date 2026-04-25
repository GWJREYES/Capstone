'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, X, Clock, User, Phone, Mail, MapPin, Award, Shield } from 'lucide-react'
import { SubApplication } from '@/types'
import { APPLICATION_STATUS_STYLES, TRADE_COLORS } from '@/lib/constants'

interface Props {
  application: SubApplication
  onApprove: (id: string, note: string) => Promise<void>
  onReject:  (id: string, note: string) => Promise<void>
}

export default function SubApplicationCard({ application: app, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote]         = useState(app.admin_note ?? '')
  const [acting, setActing]     = useState<'approve' | 'reject' | null>(null)

  const handle = async (action: 'approve' | 'reject') => {
    setActing(action)
    try {
      if (action === 'approve') await onApprove(app.id, note)
      else                      await onReject(app.id, note)
    } finally {
      setActing(null)
    }
  }

  const isPending  = app.status === 'pending'
  const statusStyle = APPLICATION_STATUS_STYLES[app.status] ?? ''
  const tradeStyle  = TRADE_COLORS[app.trade]  ?? TRADE_COLORS.foundation

  return (
    <div className="bg-[#151518] border border-[#2a2a32] rounded-lg overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1c1c21] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c8922a]/30 to-[#c8922a]/10 border border-[#c8922a]/30 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-sm text-[#e8aa40]">
            {app.company.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-sm font-semibold text-[#e8e8ee] truncate">{app.company}</span>
            <span className={`inline-flex px-2 py-0.5 rounded border font-nav text-[10px] font-semibold tracking-wider ${tradeStyle}`}>
              {app.trade.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="font-nav text-xs text-[#606070]">{app.contact_name}</span>
            <span className="font-nav text-xs text-[#606070]">{app.city}, {app.state}</span>
            <span className="font-nav text-xs text-[#606070]">
              {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded border font-nav text-[10px] font-semibold tracking-wider ${statusStyle}`}>
            {app.status.toUpperCase()}
          </span>
          {expanded ? <ChevronUp size={14} className="text-[#606070]" /> : <ChevronDown size={14} className="text-[#606070]" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#2a2a32] p-4 space-y-4">
          {/* Contact + credentials grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={<User size={12} />}    label="Contact"    value={app.contact_name} />
            <InfoRow icon={<Phone size={12} />}   label="Phone"      value={app.phone || '—'} />
            <InfoRow icon={<Mail size={12} />}    label="Email"      value={app.email} />
            <InfoRow icon={<MapPin size={12} />}  label="Location"   value={`${app.city}, ${app.state}`} />
            <InfoRow icon={<Award size={12} />}   label="License"    value={app.license_number || '—'} />
            <InfoRow icon={<Shield size={12} />}  label="Insurance"  value={app.insurance_carrier || '—'} />
            <InfoRow icon={<Clock size={12} />}   label="Experience" value={`${app.years_experience ?? 0} years`} />
            <InfoRow label="Crew Size"  value={`${app.crew_size} crew`} />
            <InfoRow label="Rate"       value={app.hourly_rate ? `$${app.hourly_rate}/hr` : '—'} />
            <InfoRow label="Lic. Expiry" value={app.license_expiry || '—'} />
          </div>

          {app.bio && (
            <div>
              <p className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1">About</p>
              <p className="font-body text-sm text-[#9090a0] leading-relaxed">{app.bio}</p>
            </div>
          )}

          {app.references_text && (
            <div>
              <p className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1">References</p>
              <p className="font-body text-sm text-[#9090a0]">{app.references_text}</p>
            </div>
          )}

          {/* Admin note + actions */}
          {isPending && (
            <div className="pt-3 border-t border-[#2a2a32] space-y-3">
              <div>
                <label className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1 block">
                  Admin Note (optional — visible to applicant if rejected)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. License needs renewal before we can onboard..."
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#3a3a48] input-gold resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handle('approve')}
                  disabled={!!acting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3eb85a]/10 hover:bg-[#3eb85a]/20 border border-[#3eb85a]/30 rounded-md font-nav text-sm font-semibold text-[#3eb85a] transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  {acting === 'approve' ? 'Approving…' : 'Approve'}
                </button>
                <button
                  onClick={() => handle('reject')}
                  disabled={!!acting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#b83232]/10 hover:bg-[#b83232]/20 border border-[#b83232]/30 rounded-md font-nav text-sm font-semibold text-[#b83232] transition-colors disabled:opacity-50"
                >
                  <X size={14} />
                  {acting === 'reject' ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </div>
          )}

          {!isPending && app.admin_note && (
            <div className="pt-3 border-t border-[#2a2a32]">
              <p className="font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1">Admin Note</p>
              <p className="font-body text-sm text-[#9090a0]">{app.admin_note}</p>
              {app.reviewed_by && (
                <p className="font-nav text-[10px] text-[#3a3a48] mt-1">
                  Reviewed by {app.reviewed_by} · {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : ''}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      {icon && <span className="text-[#606070] mt-0.5 flex-shrink-0">{icon}</span>}
      <div>
        <p className="font-nav text-[9px] uppercase tracking-wider text-[#3a3a48]">{label}</p>
        <p className="font-body text-xs text-[#9090a0]">{value}</p>
      </div>
    </div>
  )
}
