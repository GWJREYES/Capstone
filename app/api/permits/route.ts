import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const job_id = req.nextUrl.searchParams.get('job_id')
    let query = supabase
      .from('permits')
      .select('*')
      .order('created_at', { ascending: false })
    if (job_id) query = query.eq('job_id', job_id)
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
    const body = await req.json()
    const { data, error } = await supabase
      .from('permits')
      .insert([body])
      .select()
      .single()
    if (error) throw error

    // Log to timeline
    if (body.job_id) {
      await supabase.from('job_timeline').insert([{
        job_id: body.job_id,
        event_type: 'permit_update',
        description: `${body.permit_type} permit added (${body.status ?? 'not_applied'}).`,
        actor: 'Admin',
        actor_type: 'admin',
        metadata: { permit_id: data.id },
      }])
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
