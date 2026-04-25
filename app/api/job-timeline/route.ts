import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { MOCK_TIMELINE } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const job_id = req.nextUrl.searchParams.get('job_id')
    if (!job_id) return NextResponse.json([])
    const { data, error } = await supabase
      .from('job_timeline')
      .select('*')
      .eq('job_id', job_id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    const job_id = req.nextUrl.searchParams.get('job_id') ?? ''
    return NextResponse.json(MOCK_TIMELINE[job_id] ?? [])
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('job_timeline')
      .insert([body])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
