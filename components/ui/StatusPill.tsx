import { TRADE_COLORS, STATUS_STYLES } from '@/lib/constants'

interface StatusPillProps {
  type: 'trade' | 'status' | 'quote_status'
  value: string
  size?: 'sm' | 'md'
}

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  scheduled: 'Scheduled',
  inspected: 'Inspected',
  quoted: 'Quoted',
  sold: 'Sold',
  in_progress: 'In Progress',
  complete: 'Complete',
  cancelled: 'Cancelled',
  draft: 'Draft',
  sent: 'Sent',
  awaiting_signature: 'Awaiting Sig',
  signed: 'Signed',
  declined: 'Declined',
}

export default function StatusPill({ type, value, size = 'sm' }: StatusPillProps) {
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  if (type === 'trade') {
    const colorClass = TRADE_COLORS[value] || 'bg-panel text-text-secondary border-border'
    return (
      <span className={`inline-flex items-center font-nav font-semibold tracking-wide uppercase border rounded ${sizeClass} ${colorClass}`}>
        {value}
      </span>
    )
  }

  const styleClass = STATUS_STYLES[value] || 'bg-panel text-text-secondary border-border'
  const isInProgress = value === 'in_progress'

  return (
    <span className={`inline-flex items-center gap-1.5 font-nav font-semibold tracking-wide uppercase border rounded ${sizeClass} ${styleClass}`}>
      {isInProgress && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#3eb85a] status-dot-active flex-shrink-0" />
      )}
      {STATUS_LABELS[value] || value}
    </span>
  )
}
