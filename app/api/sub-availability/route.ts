import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase  = getServiceClient()
    const subId     = req.nextUrl.searchParams.get('sub_id')
    const month     = req.nextUrl.searchParams.get('month') // YYYY-MM

    let query = supabase.from('sub_availability').select('*').order('date')

    if (subId) query = query.eq('sub_id', subId)
    if (month) {
      const [y, m] = month.split('-').map(Number)
      const from   = `${y}-${String(m).padStart(2,'0')}-01`
      const to     = `${y}-${String(m).padStart(2,'0')}-${new Date(y, m, 0).getDate()}`
      query = query.gte('date', from).lte('date', to)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body     = await req.json()
    const { sub_id, date, status, note } = body

    if (!sub_id || !date || !status) {
      return NextResponse.json({ error: 'sub_id, date, and status are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('sub_availability')
      .upsert({ sub_id, date, status, note, updated_at: new Date().toISOString() },
               { onConflict: 'sub_id,date' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
