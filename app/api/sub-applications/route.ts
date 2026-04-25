import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { MOCK_APPLICATIONS } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const status = req.nextUrl.searchParams.get('status')
    let query = supabase
      .from('sub_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json(MOCK_APPLICATIONS)
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('sub_applications')
      .insert([{ ...body, status: 'pending' }])
      .select()
      .single()
    if (error) throw error

    // Notify admins of new application
    await supabase.from('notifications').insert([{
      type: 'new_application',
      title: 'New Sub Application',
      body: `${body.company} applied for ${body.trade} work.`,
      target_type: 'admin',
      reference_type: 'sub_application',
      reference_id: data.id,
    }])

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
