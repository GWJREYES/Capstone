'use client'

import { FolderOpen, ExternalLink } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">DOCS</h1>
        <p className="font-nav text-sm text-[#606070] mt-0.5">Company document library</p>
      </div>
      <div className="p-6 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full border border-[#2a2a32] bg-[#151518] flex items-center justify-center mb-4">
          <FolderOpen size={22} className="text-[#606070]" />
        </div>
        <p className="font-display text-xl tracking-wider text-[#9090a0]">DOCUMENT LIBRARY</p>
        <p className="font-body text-sm text-[#606070] mt-2 max-w-sm">
          Connect your OneDrive or Google Drive to browse and attach company documents to jobs.
        </p>
      </div>
    </div>
  )
}
