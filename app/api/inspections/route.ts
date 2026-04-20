import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const { searchParams } = new URL(req.url)
    const job_id = searchParams.get('job_id')
    let query = supabase
      .from('inspections')
      .select('*, job:jobs(job_number)')
      .order('created_at', { ascending: false })
    if (job_id) query = query.eq('job_id', job_id)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('inspections')
      .insert([body])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
