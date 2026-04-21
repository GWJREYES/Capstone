'use client'

import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  onClick: () => void
  loading: boolean
}

export default function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="p-2 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors disabled:opacity-50"
    >
      <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
    </button>
  )
}
