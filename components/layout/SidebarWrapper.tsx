'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function SidebarWrapper() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-md bg-[#151518] border border-[#2a2a32] text-[#9090a0] hover:text-[#e8e8ee] lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
