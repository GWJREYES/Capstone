import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const { searchParams } = new URL(req.url)
    const trade = searchParams.get('trade')
    const status = searchParams.get('status')

    let query = supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(*),
        subcontractor:subcontractors(*)
      `)
      .order('created_at', { ascending: false })

    if (trade) query = query.eq('trade', trade)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      if (error.message?.includes('relation "jobs" does not exist') || error.code === '42P01') {
        return NextResponse.json({ data: [], message: 'Database not configured' })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()

    const { data: lastJob } = await supabase
      .from('jobs')
      .select('job_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNum = 1
    if (lastJob?.job_number) {
      const num = parseInt(lastJob.job_number.replace('JOB-', ''), 10)
      nextNum = num + 1
    }

    const job_number = `JOB-${nextNum.toString().padStart(4, '0')}`

    const { data, error } = await supabase
      .from('jobs')
      .insert([{ ...body, job_number }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
