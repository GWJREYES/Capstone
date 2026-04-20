'use client'

import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { MOCK_CUSTOMERS } from '@/lib/constants'

const STATUS_COLORS: Record<string, string> = {
  active: '#3eb85a',
  inactive: '#606070',
  prospect: '#4a9de0',
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_CUSTOMERS.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (n: number) => `$${n.toLocaleString()}`

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">CUSTOMERS</h1>
            <p className="font-nav text-sm text-[#606070] mt-0.5">
              {MOCK_CUSTOMERS.length} customers ·{' '}
              {fmt(MOCK_CUSTOMERS.reduce((s, c) => s + (c.lifetime_value || 0), 0))} LTV
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors">
            <Plus size={16} />
            <span className="hidden sm:inline">Add Customer</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-[#2a2a32]">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606070]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-8 py-2 bg-[#151518] border border-[#2a2a32] rounded-md font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#606070]">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a32]">
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Name</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden md:table-cell">Location</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden lg:table-cell">Phone</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden sm:table-cell">Jobs</th>
              <th className="text-right px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">LTV</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070] hidden xl:table-cell">Last Contact</th>
              <th className="text-left px-4 py-3 font-nav text-[10px] font-semibold tracking-[0.12em] uppercase text-[#606070]">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-[#2a2a32]/50 table-row-hover">
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-body text-sm text-[#e8e8ee]">{c.name}</p>
                    <p className="font-nav text-[11px] text-[#606070]">{c.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <p className="font-body text-sm text-[#9090a0]">{c.city}, {c.state} {c.zip}</p>
                  <p className="font-nav text-[11px] text-[#606070]">{c.address}</p>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="font-mono text-sm text-[#9090a0]">{c.phone}</span>
                </td>
                <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                  <span className="font-mono text-sm text-[#4a9de0]">{c.jobs_count}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="font-mono text-sm text-[#e8aa40]">{fmt(c.lifetime_value || 0)}</span>
                </td>
                <td className="px-4 py-3.5 hidden xl:table-cell">
                  <span className="font-mono text-xs text-[#606070]">{c.last_contact}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[c.status] }}
                    />
                    <span className="font-nav text-xs capitalize" style={{ color: STATUS_COLORS[c.status] }}>
                      {c.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
