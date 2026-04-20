'use client'

import { Trash2, Plus } from 'lucide-react'

export interface LineItem {
  id: string
  description: string
  unit: string
  qty: number
  unit_price: number
  base_total: number
  markup_pct: number
  total_with_markup: number
  category: string
}

interface LineItemsTableProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  markupPct: number
}

export default function LineItemsTable({ items, onChange, markupPct }: LineItemsTableProps) {
  const update = (id: string, field: keyof LineItem, value: string | number) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item
      const newItem = { ...item, [field]: value }
      if (field === 'qty' || field === 'unit_price') {
        newItem.base_total = Number(newItem.qty) * Number(newItem.unit_price)
        newItem.total_with_markup = newItem.base_total * (1 + newItem.markup_pct / 100)
      }
      if (field === 'markup_pct') {
        newItem.total_with_markup = newItem.base_total * (1 + Number(value) / 100)
      }
      if (field === 'base_total') {
        newItem.total_with_markup = Number(value) * (1 + newItem.markup_pct / 100)
      }
      return newItem
    })
    onChange(updated)
  }

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))

  const addLine = () => {
    onChange([
      ...items,
      {
        id: `custom-${Date.now()}`,
        description: '',
        unit: 'ea',
        qty: 1,
        unit_price: 0,
        base_total: 0,
        markup_pct: markupPct,
        total_with_markup: 0,
        category: 'Custom',
      },
    ])
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-[#2a2a32]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0f0f12] border-b border-[#2a2a32]">
              <th className="text-left px-3 py-2 font-nav text-[10px] font-semibold tracking-[0.1em] uppercase text-[#606070]">Description</th>
              <th className="text-left px-3 py-2 font-nav text-[10px] font-semibold tracking-[0.1em] uppercase text-[#606070] hidden md:table-cell">Unit</th>
              <th className="text-right px-3 py-2 font-nav text-[10px] font-semibold tracking-[0.1em] uppercase text-[#606070]">Qty</th>
              <th className="text-right px-3 py-2 font-nav text-[10px] font-semibold tracking-[0.1em] uppercase text-[#606070] hidden sm:table-cell">Unit $</th>
              <th className="text-right px-3 py-2 font-nav text-[10px] font-semibold tracking-[0.1em] uppercase text-[#606070] hidden sm:table-cell">Base Total</th>
              <th className="text-right px-3 py-2 font-nav text-[10px] font-semibold tracking-[0.1em] uppercase text-[#606070]">w/ Markup</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a32]/50">
            {items.map((item) => (
              <tr key={item.id} className="bg-[#151518] hover:bg-[#1c1c21] transition-colors group">
                <td className="px-3 py-2">
                  <input
                    value={item.description}
                    onChange={(e) => update(item.id, 'description', e.target.value)}
                    className="w-full bg-transparent font-body text-sm text-[#e8e8ee] placeholder-[#606070] border-b border-transparent focus:border-[#c8922a] focus:outline-none transition-colors min-w-[140px]"
                    placeholder="Line item description"
                  />
                  <span className="font-nav text-[10px] text-[#606070]">{item.category}</span>
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  <input
                    value={item.unit}
                    onChange={(e) => update(item.id, 'unit', e.target.value)}
                    className="w-14 bg-transparent font-mono text-xs text-[#9090a0] border-b border-transparent focus:border-[#c8922a] focus:outline-none text-center"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => update(item.id, 'qty', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-transparent font-mono text-sm text-right text-[#e8e8ee] border-b border-transparent focus:border-[#c8922a] focus:outline-none ml-auto block"
                  />
                </td>
                <td className="px-3 py-2 hidden sm:table-cell">
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => update(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-24 bg-transparent font-mono text-sm text-right text-[#e8e8ee] border-b border-transparent focus:border-[#c8922a] focus:outline-none ml-auto block"
                  />
                </td>
                <td className="px-3 py-2 text-right hidden sm:table-cell">
                  <span className="font-mono text-sm text-[#9090a0]">{fmt(item.base_total)}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="font-mono text-sm text-[#e8aa40] font-semibold">{fmt(item.total_with_markup)}</span>
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#606070] hover:text-[#b83232] transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addLine}
        className="mt-2 flex items-center gap-2 px-3 py-1.5 text-[#c8922a] hover:text-[#e8aa40] font-nav text-xs font-semibold transition-colors"
      >
        <Plus size={13} />
        Add Line Item
      </button>
    </div>
  )
}
