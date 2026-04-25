import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const job_id = req.nextUrl.searchParams.get('job_id')
    const sub_id = req.nextUrl.searchParams.get('sub_id')
    let query = supabase
      .from('sub_daily_updates')
      .select('*, subcontractor:subcontractors(company,contact_name)')
      .order('update_date', { ascending: false })
    if (job_id) query = query.eq('job_id', job_id)
    if (sub_id) query = query.eq('subcontractor_id', sub_id)
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
      .from('sub_daily_updates')
      .insert([body])
      .select('*, subcontractor:subcontractors(company,contact_name)')
      .single()
    if (error) throw error

    // Log to timeline
    if (body.job_id) {
      await supabase.from('job_timeline').insert([{
        job_id: body.job_id,
        event_type: 'daily_update',
        description: `Daily update: ${body.work_completed?.slice(0, 120) ?? ''}${(body.work_completed?.length ?? 0) > 120 ? '…' : ''}`,
        actor: data.subcontractor?.company ?? 'Subcontractor',
        actor_type: 'subcontractor',
        metadata: { completion_pct: body.completion_pct, crew_on_site: body.crew_on_site },
      }])

      // Notify admin
      await supabase.from('notifications').insert([{
        type: 'daily_update',
        title: 'Daily Update Submitted',
        body: `${data.subcontractor?.company ?? 'A subcontractor'} submitted an update — ${body.completion_pct ?? 0}% complete.`,
        target_type: 'admin',
        reference_type: 'job',
        reference_id: body.job_id,
      }])
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
