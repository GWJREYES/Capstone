import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('audit_records')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
