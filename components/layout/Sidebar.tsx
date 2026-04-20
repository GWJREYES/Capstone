'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, ClipboardList, Users, Wand2,
  FileText, HardHat, Clipboard, FolderOpen, CreditCard, X,
  ChevronRight
} from 'lucide-react'

const navGroups = [
  {
    label: 'Operations',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/audit', label: 'Audit', icon: ClipboardList },
      { href: '/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Estimating',
    items: [
      { href: '/estimator', label: 'AI Estimator', icon: Wand2 },
      { href: '/quotes', label: 'Quotes', icon: FileText },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/subs', label: 'Subcontractors', icon: HardHat },
      { href: '/inspect', label: 'Inspection Forms', icon: Clipboard },
      { href: '/docs', label: 'Docs', icon: FolderOpen },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/payments', label: 'Payments', icon: CreditCard },
    ],
  },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const content = (
    <div className="flex flex-col h-full bg-[#0f0f12] border-r border-[#2a2a32] w-60">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#c8922a] rounded-sm flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#0f0f12] rounded-[2px]" />
          </div>
          <span className="font-display text-2xl tracking-widest text-[#e8aa40]">CAPSTONE</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#606070] hover:text-[#e8e8ee] lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-3 py-1 mb-1">
              <span className="font-nav text-[10px] font-semibold tracking-[0.15em] uppercase text-[#606070]">
                {group.label}
              </span>
            </div>
            {group.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 group transition-all duration-150 ${
                  isActive(href)
                    ? 'bg-[#c8922a]/10 text-[#e8aa40] border border-[#c8922a]/20'
                    : 'text-[#9090a0] hover:text-[#e8e8ee] hover:bg-[#151518]'
                }`}
              >
                <Icon size={16} className={isActive(href) ? 'text-[#c8922a]' : 'text-current'} />
                <span className="font-nav text-sm font-medium tracking-wide">{label}</span>
                {isActive(href) && (
                  <ChevronRight size={12} className="ml-auto text-[#c8922a]/60" />
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-[#2a2a32]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#c8922a]/20 border border-[#c8922a]/30 flex items-center justify-center">
            <span className="font-display text-sm text-[#e8aa40]">J</span>
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-[#e8e8ee] leading-none">Justin</p>
            <p className="font-nav text-[11px] text-[#606070] mt-0.5 tracking-wide">General Contractor</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile overlay only — desktop is rendered separately in SidebarWrapper
  if (typeof open !== 'undefined') {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-40 overlay-backdrop lg:hidden"
            onClick={onClose}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </div>
      </>
    )
  }

  return content
}
