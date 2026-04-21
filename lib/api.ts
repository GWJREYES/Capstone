// Direct Supabase client — runs in the browser, bypassing server-side API routes.
// Falls back to mock data when Supabase is not configured.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { MOCK_JOBS, MOCK_SUBS, MOCK_CUSTOMERS } from './constants'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || url.includes('your_supabase') || !key || key.includes('your_supabase')) {
      throw new Error('Supabase not configured')
    }
    _client = createClient(url, key)
  }
  return _client
}

async function nextJobNumber(supabase: SupabaseClient): Promise<string> {
  try {
    const { data } = await supabase
      .from('jobs')
      .select('job_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data?.job_number) {
      const n = parseInt(data.job_number.replace('JOB-', ''), 10) + 1
      return `JOB-${n.toString().padStart(4, '0')}`
    }
  } catch {}
  return `JOB-${Date.now().toString().slice(-4)}`
}

async function nextQuoteNumber(supabase: SupabaseClient): Promise<string> {
  try {
    const { data } = await supabase
      .from('quotes')
      .select('quote_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data?.quote_number) {
      const n = parseInt(data.quote_number.replace('QT-', ''), 10) + 1
      return `QT-${n.toString().padStart(4, '0')}`
    }
  } catch {}
  return `QT-${Date.now().toString().slice(-4)}`
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function fetchJobs(params?: { trade?: string; status?: string }) {
  try {
    const supabase = getClient()
    let query = supabase
      .from('jobs')
      .select('*, customer:customers(*), subcontractor:subcontractors(*)')
      .order('created_at', { ascending: false })
    if (params?.trade) query = query.eq('trade', params.trade)
    if (params?.status) query = query.eq('status', params.status)
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch {
    return MOCK_JOBS as any[]
  }
}

export async function createJob(body: Record<string, any>) {
  try {
    const supabase = getClient()
    const job_number = await nextJobNumber(supabase)
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ ...body, job_number }])
      .select('*, customer:customers(*), subcontractor:subcontractors(*)')
      .single()
    if (error) throw error
    return data
  } catch (e: any) {
    throw e
  }
}

export async function updateJob(id: string, body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('jobs')
    .update(body)
    .eq('id', id)
    .select('*, customer:customers(*), subcontractor:subcontractors(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteJob(id: string) {
  const supabase = getClient()
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

// ─── Subcontractors ──────────────────────────────────────────────────────────

export async function fetchSubs() {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .order('company')
    if (error) throw error
    return data || []
  } catch {
    return MOCK_SUBS as any[]
  }
}

export async function createSub(body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('subcontractors')
    .insert([body])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSub(id: string, body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('subcontractors')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function fetchCustomers() {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    if (error) throw error
    return data || []
  } catch {
    return MOCK_CUSTOMERS as any[]
  }
}

export async function createCustomer(body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('customers')
    .insert([body])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCustomer(id: string, body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('customers')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function fetchQuotes() {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('quotes')
      .select('*, customer:customers(*), job:jobs(job_number)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function createQuote(body: Record<string, any>) {
  try {
    const supabase = getClient()
    const quote_number = await nextQuoteNumber(supabase)
    const { data, error } = await supabase
      .from('quotes')
      .insert([{ ...body, quote_number }])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e: any) {
    throw e
  }
}

export async function updateQuote(id: string, body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('quotes')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteQuote(id: string) {
  const supabase = getClient()
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function fetchPayments() {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*, customer:customers(*), job:jobs(job_number)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function createPayment(body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
    .insert([body])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markPaymentPaid(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export async function fetchAudits() {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('audit_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function updateAudit(id: string, body: Record<string, any>) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('audit_records')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Inspections ─────────────────────────────────────────────────────────────

export async function fetchInspections(job_id?: string) {
  try {
    const supabase = getClient()
    let query = supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false })
    if (job_id) query = query.eq('job_id', job_id)
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function createInspection(body: Record<string, any>) {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('inspections')
      .insert([body])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e: any) {
    throw e
  }
}
