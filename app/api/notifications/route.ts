import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const target = (req.nextUrl.searchParams.get('target') ?? 'admin') as 'admin' | 'sub'
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('target_type', target)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const { ids, all } = await req.json()
    if (all) {
      await supabase.from('notifications').update({ read: true }).eq('target_type', 'admin').eq('read', false)
    } else if (ids?.length) {
      await supabase.from('notifications').update({ read: true }).in('id', ids)
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
