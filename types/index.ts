export type Trade = 'foundation' | 'roofing' | 'remodel' | 'kitchen' | 'concrete' | 'framing' | 'windows' | 'siding' | 'exterior' | 'hvac' | 'plumbing' | 'electrical'

export type JobStatus = 'lead' | 'scheduled' | 'inspected' | 'quoted' | 'sold' | 'in_progress' | 'complete' | 'cancelled'

export type QuoteStatus = 'draft' | 'sent' | 'awaiting_signature' | 'signed' | 'declined'

export type SubStatus = 'available' | 'busy' | 'unavailable'

export interface Customer {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  jobs_count?: number
  lifetime_value?: number
  last_contact?: string
  status: 'active' | 'inactive' | 'prospect'
  created_at: string
}

export interface Subcontractor {
  id: string
  company: string
  contact_name: string
  trade: Trade
  crew_size: number
  status: SubStatus
  license_number: string
  license_expiry: string
  hourly_rate: number
  phone: string
  email: string
  city: string
  state: string
  created_at: string
}

export interface Job {
  id: string
  job_number: string
  customer_id: string
  customer?: Customer
  subcontractor_id?: string
  subcontractor?: Subcontractor
  trade: Trade
  status: JobStatus
  address: string
  city: string
  state: string
  matterport_url?: string
  onedrive_url?: string
  rilla_url?: string
  rilla_score?: number
  audit_complete: boolean
  quoted_value?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  job_id?: string
  job?: Job
  customer_id: string
  customer?: Customer
  quote_number: string
  status: QuoteStatus
  subtotal: number
  waste_amount: number
  tax_amount: number
  labor_amount: number
  permit_amount: number
  markup_amount: number
  total: number
  margin: number
  trade: Trade
  notes?: string
  created_at: string
  updated_at: string
}

export interface QuoteLineItem {
  id: string
  quote_id: string
  description: string
  unit: string
  qty: number
  unit_price: number
  base_total: number
  markup_pct: number
  total_with_markup: number
  category: string
}

export interface Payment {
  id: string
  job_id: string
  job?: Job
  customer_id: string
  customer?: Customer
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'partial'
  due_date: string
  paid_date?: string
  stripe_payment_id?: string
  notes?: string
  created_at: string
}

export interface Inspection {
  id: string
  job_id: string
  job?: Job
  inspector_name: string
  trade: Trade
  inspection_date: string
  items: InspectionItem[]
  matterport_url?: string
  onedrive_url?: string
  rilla_url?: string
  notes?: string
  created_at: string
}

export interface InspectionItem {
  id: string
  label: string
  severity: 'HIGH' | 'MED' | 'LOW'
  checked: boolean
  notes?: string
}

export interface AuditRecord {
  id: string
  job_id: string
  tech_name: string
  rilla_score: number
  talk_ratio: number
  open_questions: number
  duration_minutes: number
  outcome: string
  rilla_reviewed: boolean
  matterport_complete: boolean
  go3s_uploaded: boolean
  follow_up_sent: boolean
  quote_generated: boolean
  coaching_note?: string
  created_at: string
}

// ─── Subcontractor Operations Module ─────────────────────────────────────────

export type SubApplicationStatus = 'pending' | 'approved' | 'rejected'

export type PermitStatus =
  | 'not_applied'
  | 'pending'
  | 'approved'
  | 'active'
  | 'inspection_due'
  | 'closed'
  | 'rejected'

export type TimelineEventType =
  | 'status_change'
  | 'note'
  | 'assignment'
  | 'permit_update'
  | 'daily_update'
  | 'milestone'
  | 'document'

export interface SubApplication {
  id: string
  company: string
  contact_name: string
  trade: Trade
  crew_size: number
  license_number: string
  license_expiry: string
  hourly_rate: number
  phone: string
  email: string
  city: string
  state: string
  bio: string
  years_experience: number
  insurance_carrier: string
  insurance_policy: string
  references_text: string
  status: SubApplicationStatus
  admin_note?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface Permit {
  id: string
  job_id: string
  permit_number?: string
  permit_type: string
  status: PermitStatus
  applied_date?: string
  approved_date?: string
  expiry_date?: string
  fee?: number
  issuing_authority?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface SubDailyUpdate {
  id: string
  job_id: string
  subcontractor_id: string
  subcontractor?: Subcontractor
  update_date: string
  crew_on_site: number
  hours_worked: number
  work_completed: string
  work_planned?: string
  blockers?: string
  materials_needed?: string
  weather?: string
  completion_pct: number
  created_at: string
}

export interface JobTimelineEvent {
  id: string
  job_id: string
  event_type: TimelineEventType
  from_status?: string | null
  to_status?: string | null
  description: string
  actor: string
  actor_type: 'admin' | 'subcontractor' | 'system'
  metadata: Record<string, any>
  created_at: string
}

export interface AppNotification {
  id: string
  type: string
  title: string
  body?: string
  target_type: 'admin' | 'sub'
  target_id?: string
  reference_type?: string
  reference_id?: string
  read: boolean
  created_at: string
}
