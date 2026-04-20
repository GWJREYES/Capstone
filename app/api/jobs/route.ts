import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { MOCK_JOBS } from '@/lib/constants'

// Normalise mock jobs to the flat DB shape pages expect
function normaliseMock(jobs: any[]) {
  return jobs.map((j) => ({
    ...j,
    customer_name: j.customer?.name,
    customer_city: j.customer?.city,
    customer_state: j.customer?.state,
    customer_address: j.customer?.address,
    subcontractor_name: j.subcontractor?.company ?? null,
  }))
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const { searchParams } = new URL(req.url)
    const trade = searchParams.get('trade')
    const status = searchParams.get('status')

    let query = supabase
      .from('jobs')
      .select('*, customer:customers(*), subcontractor:subcontractors(*)')
      .order('created_at', { ascending: false })

    if (trade) query = query.eq('trade', trade)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: normaliseMock(MOCK_JOBS as any[]) })
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
      nextNum = parseInt(lastJob.job_number.replace('JOB-', ''), 10) + 1
    }
    const job_number = `JOB-${nextNum.toString().padStart(4, '0')}`

    const { data, error } = await supabase
      .from('jobs')
      .insert([{ ...body, job_number }])
      .select('*, customer:customers(*), subcontractor:subcontractors(*)')
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
