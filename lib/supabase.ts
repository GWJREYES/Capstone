import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

let _supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = getSupabaseUrl()
    const key = getSupabaseAnonKey()
    if (!url || !key) throw new Error('Supabase URL and anon key are required')
    _supabase = createClient(url, key)
  }
  return _supabase
}

export { getSupabaseClient as supabase }

export function getServiceClient(): SupabaseClient {
  const url = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !serviceKey) throw new Error('Supabase URL and service role key are required')
  return createClient(url, serviceKey)
}
