'use client'

import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export default function Modal({ open, onClose, title, children, footer, width = 'md' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop p-4 animate-fade-in">
      <div
        className={`w-full ${widths[width]} bg-[#0f0f12] border border-[#2a2a32] rounded-lg overflow-hidden flex flex-col max-h-[90vh] animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a32] flex-shrink-0">
          <h2 className="font-display text-xl tracking-wider text-[#e8e8ee]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[#2a2a32] flex-shrink-0 flex gap-3">
            {footer}
          </div>
        )}
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
