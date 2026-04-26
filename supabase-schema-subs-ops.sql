-- =========================================================
-- SUBCONTRACTOR OPERATIONS MODULE — additive migration
-- Run AFTER supabase-schema.sql (base schema must exist)
-- =========================================================

-- Subcontractor application / signup flow
CREATE TABLE IF NOT EXISTS sub_applications (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  company           text        NOT NULL,
  contact_name      text        NOT NULL,
  trade             text        NOT NULL,
  crew_size         int         DEFAULT 1,
  license_number    text,
  license_expiry    date,
  hourly_rate       numeric(10,2),
  phone             text,
  email             text        NOT NULL,
  city              text,
  state             text        DEFAULT 'MA',
  bio               text,
  years_experience  int         DEFAULT 0,
  insurance_carrier text,
  insurance_policy  text,
  references_text   text,
  status            text        DEFAULT 'pending'
                                CHECK (status IN ('pending','approved','rejected')),
  admin_note        text,
  reviewed_by       text,
  reviewed_at       timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- Permit tracking — one or many permits per job
CREATE TABLE IF NOT EXISTS permits (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id             uuid        REFERENCES jobs(id) ON DELETE CASCADE,
  permit_number      text,
  permit_type        text        NOT NULL,          -- building, electrical, plumbing, mechanical, demolition
  status             text        DEFAULT 'not_applied'
                                 CHECK (status IN (
                                   'not_applied','pending','approved',
                                   'active','inspection_due','closed','rejected'
                                 )),
  applied_date       date,
  approved_date      date,
  expiry_date        date,
  fee                numeric(10,2),
  issuing_authority  text,
  notes              text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- Daily field updates submitted by subcontractors
CREATE TABLE IF NOT EXISTS sub_daily_updates (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id            uuid        REFERENCES jobs(id) ON DELETE CASCADE,
  subcontractor_id  uuid        REFERENCES subcontractors(id),
  update_date       date        DEFAULT CURRENT_DATE,
  crew_on_site      int         DEFAULT 1,
  hours_worked      numeric(4,1) DEFAULT 8,
  work_completed    text        NOT NULL,
  work_planned      text,
  blockers          text,
  materials_needed  text,
  weather           text,
  completion_pct    int         DEFAULT 0
                                CHECK (completion_pct BETWEEN 0 AND 100),
  created_at        timestamptz DEFAULT now()
);

-- Immutable audit trail of job events
CREATE TABLE IF NOT EXISTS job_timeline (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id       uuid        REFERENCES jobs(id) ON DELETE CASCADE,
  event_type   text        NOT NULL
               CHECK (event_type IN (
                 'status_change','note','assignment',
                 'permit_update','daily_update','milestone','document'
               )),
  from_status  text,
  to_status    text,
  description  text        NOT NULL,
  actor        text        DEFAULT 'System',
  actor_type   text        DEFAULT 'system'
               CHECK (actor_type IN ('admin','subcontractor','system')),
  metadata     jsonb       DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);

-- In-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  type            text        NOT NULL,
  title           text        NOT NULL,
  body            text,
  target_type     text        DEFAULT 'admin'
                              CHECK (target_type IN ('admin','sub')),
  target_id       uuid,
  reference_type  text,
  reference_id    uuid,
  read            boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- ─── Triggers ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_permits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS permits_updated_at ON permits;
CREATE TRIGGER permits_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW EXECUTE FUNCTION update_permits_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sub_applications_status
  ON sub_applications(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_permits_job
  ON permits(job_id);

CREATE INDEX IF NOT EXISTS idx_daily_updates_job
  ON sub_daily_updates(job_id, update_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_updates_sub
  ON sub_daily_updates(subcontractor_id, update_date DESC);

CREATE INDEX IF NOT EXISTS idx_job_timeline_job
  ON job_timeline(job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_admin_unread
  ON notifications(target_type, read, created_at DESC);

-- Sub availability calendar — one row per sub per day
CREATE TABLE IF NOT EXISTS sub_availability (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  sub_id     uuid        NOT NULL REFERENCES subcontractors(id) ON DELETE CASCADE,
  date       date        NOT NULL,
  status     text        NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available', 'busy', 'unavailable')),
  note       text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (sub_id, date)
);

CREATE INDEX IF NOT EXISTS idx_sub_availability_sub
  ON sub_availability(sub_id, date);

CREATE INDEX IF NOT EXISTS idx_sub_availability_date
  ON sub_availability(date);

-- Sub work status on jobs (sub's perspective, separate from overall job status)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sub_status text DEFAULT 'not_started'
  CHECK (sub_status IN ('not_started','mobilizing','in_progress','punch_list','work_complete'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sub_progress_pct int DEFAULT 0
  CHECK (sub_progress_pct BETWEEN 0 AND 100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sub_last_update timestamptz;
