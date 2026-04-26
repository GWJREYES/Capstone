import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const archived = req.nextUrl.searchParams.get('archived') === 'true'
  try {
    const supabase = getServiceClient()

    // Try with archived filter first; fall back to unfiltered if column doesn't exist yet
    let { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('archived', archived)
      .order('company')

    if (error) {
      // archived column may not exist — fetch all and filter in code
      const fallback = await supabase.from('subcontractors').select('*').order('company')
      if (fallback.error) throw fallback.error
      data = (fallback.data || []).filter((s: any) =>
        archived ? s.archived === true : !s.archived
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('subcontractors')
      .insert([body])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
