import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('sub_applications')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const body = await req.json()

    const { data, error } = await supabase
      .from('sub_applications')
      .update({ ...body, reviewed_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error

    // If approved: auto-create subcontractor record
    if (body.status === 'approved' && data) {
      const { company, contact_name, trade, crew_size, license_number,
              license_expiry, hourly_rate, phone, email, city, state } = data

      // Check if sub already exists by email to avoid duplicates
      const { data: existing } = await supabase
        .from('subcontractors')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (!existing) {
        const { error: insertError } = await supabase.from('subcontractors').insert([{
          company, contact_name, trade,
          crew_size: crew_size ?? 1,
          license_number: license_number ?? null,
          license_expiry: license_expiry ?? null,
          hourly_rate: hourly_rate ?? null,
          phone: phone ?? null,
          email,
          city: city ?? null,
          state: state ? String(state).slice(0, 2) : null,
          status: 'available',
        }])
        if (insertError) throw new Error(`Approved but failed to create sub record: ${insertError.message}`)
      }

      // Send Supabase Auth invite so the sub can set their password
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${appUrl}/sub-portal`,
      })
      // Non-fatal: sub may already have an auth account
      if (inviteError && !inviteError.message.includes('already been registered')) {
        console.error('Invite email failed:', inviteError.message)
      }
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient()
    const { error } = await supabase.from('sub_applications').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
