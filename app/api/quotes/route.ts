import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const MOCK_QUOTES = [
  { id: '1', quote_number: 'QT-2026-001', customer_id: '1', customer: { name: 'Rivera Residence' }, trade: 'roofing', status: 'signed', subtotal: 14200, waste_amount: 1704, tax_amount: 997, labor_amount: 3400, permit_amount: 0, markup_amount: 4197, total: 18500, margin: 26.8, notes: '', created_at: '2026-04-10', updated_at: '2026-04-15' },
  { id: '2', quote_number: 'QT-2026-002', customer_id: '2', customer: { name: 'Walsh Commercial' }, trade: 'foundation', status: 'awaiting_signature', subtotal: 31000, waste_amount: 4650, tax_amount: 2231, labor_amount: 7200, permit_amount: 500, markup_amount: 12419, total: 42000, margin: 28.6, notes: '', created_at: '2026-04-12', updated_at: '2026-04-18' },
  { id: '3', quote_number: 'QT-2026-003', customer_id: '3', customer: { name: 'Chen Remodel' }, trade: 'kitchen', status: 'sent', subtotal: 19800, waste_amount: 2376, tax_amount: 1386, labor_amount: 3520, permit_amount: 250, markup_amount: 9968, total: 29800, margin: 30.1, notes: '', created_at: '2026-04-14', updated_at: '2026-04-16' },
  { id: '4', quote_number: 'QT-2026-004', customer_id: '4', customer: { name: 'Kowalski Home' }, trade: 'siding', status: 'draft', subtotal: 7100, waste_amount: 710, tax_amount: 491, labor_amount: 1640, permit_amount: 0, markup_amount: 2695, total: 9800, margin: 27.5, notes: '', created_at: '2026-04-17', updated_at: '2026-04-17' },
  { id: '5', quote_number: 'QT-2026-005', customer_id: '5', customer: { name: 'Patel Properties' }, trade: 'concrete', status: 'declined', subtotal: 8400, waste_amount: 672, tax_amount: 569, labor_amount: 2400, permit_amount: 0, markup_amount: 3294, total: 11200, margin: 29.4, notes: '', created_at: '2026-03-20', updated_at: '2026-04-01' },
  { id: '6', quote_number: 'QT-2026-006', customer_id: '1', customer: { name: 'Torres Framing LLC' }, trade: 'framing', status: 'sent', subtotal: 24800, waste_amount: 1984, tax_amount: 1668, labor_amount: 5740, permit_amount: 350, markup_amount: 12108, total: 33600, margin: 26.3, notes: '', created_at: '2026-04-18', updated_at: '2026-04-18' },
]

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('quotes')
      .select('*, customer:customers(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: MOCK_QUOTES })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()

    const { data: lastQuote } = await supabase
      .from('quotes')
      .select('quote_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const year = new Date().getFullYear()
    let nextNum = 1
    if (lastQuote?.quote_number) {
      const parts = lastQuote.quote_number.split('-')
      nextNum = parseInt(parts[parts.length - 1], 10) + 1
    }
    const quote_number = `QT-${year}-${nextNum.toString().padStart(3, '0')}`

    const { data, error } = await supabase
      .from('quotes')
      .insert([{ ...body, quote_number }])
      .select('*, customer:customers(name)')
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
