import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const MOCK_AUDITS = [
  { id: '1', job_id: 'JOB-0001', customer: 'Rivera Residence', tech_name: 'Carlos Rivera', rilla_score: 84, talk_ratio: 68, open_questions: 4, duration_minutes: 52, outcome: 'Quote Sent', rilla_reviewed: true, matterport_complete: true, go3s_uploaded: false, follow_up_sent: true, quote_generated: true, coaching_note: 'Great open-ended questions. Work on presenting pricing earlier.' },
  { id: '2', job_id: 'JOB-0002', customer: 'Walsh Commercial', tech_name: 'Marcus Walsh', rilla_score: 71, talk_ratio: 72, open_questions: 2, duration_minutes: 38, outcome: 'Follow-up Needed', rilla_reviewed: true, matterport_complete: true, go3s_uploaded: true, follow_up_sent: false, quote_generated: false, coaching_note: '' },
  { id: '3', job_id: 'JOB-0004', customer: 'Kowalski Home', tech_name: 'Jake Torres', rilla_score: 62, talk_ratio: 81, open_questions: 1, duration_minutes: 29, outcome: 'No Decision', rilla_reviewed: false, matterport_complete: true, go3s_uploaded: false, follow_up_sent: false, quote_generated: false, coaching_note: '' },
  { id: '4', job_id: 'JOB-0005', customer: 'Patel Properties', tech_name: 'Sofia Chen', rilla_score: 78, talk_ratio: 61, open_questions: 6, duration_minutes: 65, outcome: 'Quote Requested', rilla_reviewed: false, matterport_complete: false, go3s_uploaded: false, follow_up_sent: false, quote_generated: false, coaching_note: '' },
]

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('audit_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: MOCK_AUDITS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()
    const { data, error } = await supabase
      .from('audit_records')
      .insert([body])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
