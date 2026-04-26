import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { MOCK_SUBS } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const archived = req.nextUrl.searchParams.get('archived') === 'true'
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('archived', archived)
      .order('company')
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: archived ? [] : MOCK_SUBS })
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
