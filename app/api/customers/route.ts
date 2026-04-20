import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { MOCK_CUSTOMERS } from '@/lib/constants'

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: MOCK_CUSTOMERS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('customers')
      .insert([body])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
