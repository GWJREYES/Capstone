import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('permits')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error

    // Log status changes to timeline
    if (body.status && data?.job_id) {
      await supabase.from('job_timeline').insert([{
        job_id: data.job_id,
        event_type: 'permit_update',
        description: `${data.permit_type} permit status updated to ${body.status}.`,
        actor: 'Admin',
        actor_type: 'admin',
        metadata: { permit_id: params.id, new_status: body.status },
      }])
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const { error } = await supabase.from('permits').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
