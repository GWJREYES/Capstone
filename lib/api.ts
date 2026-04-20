// Typed fetch client — all pages call these instead of hitting Supabase directly.
// API routes handle the Supabase connection and fall back to mock data when not configured.

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`)
  return json
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function fetchJobs(params?: { trade?: string; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.trade) qs.set('trade', params.trade)
  if (params?.status) qs.set('status', params.status)
  const { data } = await apiFetch<{ data: any[] }>(`/api/jobs?${qs}`)
  return data
}

export async function createJob(body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data
}

export async function updateJob(id: string, body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>(`/api/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data
}

export async function deleteJob(id: string) {
  return apiFetch(`/api/jobs/${id}`, { method: 'DELETE' })
}

// ─── Subcontractors ──────────────────────────────────────────────────────────

export async function fetchSubs() {
  const { data } = await apiFetch<{ data: any[] }>('/api/subs')
  return data
}

export async function createSub(body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>('/api/subs', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data
}

export async function updateSub(id: string, body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>(`/api/subs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function fetchCustomers() {
  const { data } = await apiFetch<{ data: any[] }>('/api/customers')
  return data
}

export async function createCustomer(body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data
}

export async function updateCustomer(id: string, body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>(`/api/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function fetchQuotes() {
  const { data } = await apiFetch<{ data: any[] }>('/api/quotes')
  return data
}

export async function createQuote(body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data
}

export async function updateQuote(id: string, body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>(`/api/quotes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data
}

export async function deleteQuote(id: string) {
  return apiFetch(`/api/quotes/${id}`, { method: 'DELETE' })
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function fetchPayments() {
  const { data } = await apiFetch<{ data: any[] }>('/api/payments')
  return data
}

export async function createPayment(body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>('/api/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data
}

export async function markPaymentPaid(id: string) {
  const { data } = await apiFetch<{ data: any }>('/api/payments', {
    method: 'PATCH',
    body: JSON.stringify({ id, status: 'paid', paid_date: new Date().toISOString().split('T')[0] }),
  })
  return data
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export async function fetchAudits() {
  const { data } = await apiFetch<{ data: any[] }>('/api/audit')
  return data
}

export async function updateAudit(id: string, body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>(`/api/audit/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return data
}

// ─── Inspections ─────────────────────────────────────────────────────────────

export async function fetchInspections(job_id?: string) {
  const qs = job_id ? `?job_id=${job_id}` : ''
  const { data } = await apiFetch<{ data: any[] }>(`/api/inspections${qs}`)
  return data
}

export async function createInspection(body: Record<string, any>) {
  const { data } = await apiFetch<{ data: any }>('/api/inspections', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data
}
