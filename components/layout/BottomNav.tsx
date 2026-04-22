'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Wand2, ClipboardList, MoreHorizontal } from 'lucide-react'

const items = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/estimator', label: 'Estimate', icon: Wand2 },
  { href: '/audit', label: 'Audit', icon: ClipboardList },
  { href: '/subs', label: 'More', icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f0f12] border-t border-[#2a2a32] lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-150 ${
                active ? 'text-[#e8aa40]' : 'text-[#606070] hover:text-[#9090a0]'
              }`}
            >
              {active && (
                <span className="absolute -top-[1px] left-2 right-2 h-[2px] rounded-full bg-[#c8922a]" />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="font-nav text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
