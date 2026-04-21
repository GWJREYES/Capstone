'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#151518] border border-[#2a2a32] rounded-md pl-8 pr-8 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] focus:outline-none focus:border-[#c8922a]/50 transition-colors"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#606070] hover:text-[#e8e8ee] transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  )
}
