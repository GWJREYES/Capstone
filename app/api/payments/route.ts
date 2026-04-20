import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const MOCK_PAYMENTS = [
  { id: '1', customer_id: '1', customer: { name: 'Rivera Residence' }, job_id: '1', job: { job_number: 'JOB-0001' }, amount: 18500, status: 'pending', due_date: '2026-05-01', description: 'Roofing project completion', notes: '' },
  { id: '2', customer_id: '2', customer: { name: 'Walsh Commercial' }, job_id: '2', job: { job_number: 'JOB-0002' }, amount: 21000, status: 'pending', due_date: '2026-04-25', description: 'Foundation deposit (50%)', notes: '' },
  { id: '3', customer_id: '3', customer: { name: 'Chen Remodel' }, job_id: '3', job: { job_number: 'JOB-0003' }, amount: 14900, status: 'paid', due_date: '2026-04-15', paid_date: '2026-04-14', description: 'Kitchen remodel - final', notes: '' },
  { id: '4', customer_id: '5', customer: { name: 'Patel Properties' }, job_id: '5', job: { job_number: 'JOB-0005' }, amount: 5600, status: 'overdue', due_date: '2026-04-10', description: 'Concrete work deposit', notes: '' },
]

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*, customer:customers(name), job:jobs(job_number)')
      .order('due_date')
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: MOCK_PAYMENTS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('payments')
      .insert([body])
      .select('*, customer:customers(name), job:jobs(job_number)')
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const { id, ...body } = await req.json()
    const { data, error } = await supabase
      .from('payments')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
