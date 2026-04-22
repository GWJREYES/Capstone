import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatBlockProps {
  label: string
  value: string | number
  sub?: string
  trend?: number
  color?: 'gold' | 'green' | 'blue' | 'red' | 'default'
  icon?: React.ReactNode
}

const colorMap = {
  gold: 'text-[#e8aa40]',
  green: 'text-[#3eb85a]',
  blue: 'text-[#4a9de0]',
  red: 'text-[#b83232]',
  default: 'text-[#e8e8ee]',
}

export default function StatBlock({ label, value, sub, trend, color = 'default', icon }: StatBlockProps) {
  return (
    <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-nav text-[11px] font-semibold tracking-[0.12em] uppercase text-[#606070]">
          {label}
        </span>
        {icon && <span className="text-[#606070]">{icon}</span>}
      </div>
      <span className={`font-display text-2xl tracking-wide ${colorMap[color]}`}>
        {value}
      </span>
      <div className="flex items-center gap-1.5 min-h-[16px]">
        {trend !== undefined && (
          <>
            {trend > 0 && <TrendingUp size={11} className="text-[#3eb85a]" />}
            {trend < 0 && <TrendingDown size={11} className="text-[#b83232]" />}
            {trend === 0 && <Minus size={11} className="text-[#606070]" />}
            <span className={`font-nav text-[10px] font-semibold ${trend > 0 ? 'text-[#3eb85a]' : trend < 0 ? 'text-[#b83232]' : 'text-[#606070]'}`}>
              {trend > 0 ? `+${trend}` : trend} this week
            </span>
          </>
        )}
        {sub && !trend && (
          <span className="font-nav text-[11px] text-[#9090a0]">{sub}</span>
        )}
      </div>
    </div>
  )
}
