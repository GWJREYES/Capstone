import RefreshButton from './RefreshButton'

interface PageHeaderProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  loading?: boolean
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, onRefresh, loading = false, actions }: PageHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">{title}</h1>
          {subtitle && <p className="font-nav text-sm text-[#606070] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onRefresh && <RefreshButton onClick={onRefresh} loading={loading} />}
        </div>
      </div>
    </div>
  )
}
