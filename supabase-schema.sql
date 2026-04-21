-- CAPSTONE Field Operations Platform
-- Safe to re-run: uses IF NOT EXISTS on all tables

create extension if not exists "uuid-ossp";

-- Customers
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  city text,
  state char(2),
  zip varchar(10),
  phone varchar(20),
  email text,
  status text default 'prospect' check (status in ('active', 'inactive', 'prospect')),
  created_at timestamptz default now()
);

-- Subcontractors
create table if not exists subcontractors (
  id uuid primary key default uuid_generate_v4(),
  company text not null,
  contact_name text,
  trade text not null,
  crew_size int default 1,
  status text default 'available' check (status in ('available', 'busy', 'unavailable')),
  license_number text,
  license_expiry date,
  hourly_rate numeric(10,2),
  phone varchar(20),
  email text,
  city text,
  state char(2),
  created_at timestamptz default now()
);

-- Jobs
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  job_number text unique not null,
  customer_id uuid references customers(id),
  subcontractor_id uuid references subcontractors(id),
  trade text not null,
  status text default 'lead' check (status in ('lead','scheduled','inspected','quoted','sold','in_progress','complete','cancelled')),
  address text,
  city text,
  state char(2),
  matterport_url text,
  onedrive_url text,
  rilla_url text,
  rilla_score int check (rilla_score between 0 and 100),
  audit_complete boolean default false,
  quoted_value numeric(12,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quotes
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id),
  customer_id uuid references customers(id),
  quote_number text unique not null,
  status text default 'draft' check (status in ('draft','sent','awaiting_signature','signed','declined')),
  trade text,
  subtotal numeric(12,2) default 0,
  waste_amount numeric(12,2) default 0,
  tax_amount numeric(12,2) default 0,
  labor_amount numeric(12,2) default 0,
  permit_amount numeric(12,2) default 0,
  markup_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  margin numeric(6,3) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quote Line Items
create table if not exists quote_line_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  description text not null,
  unit text,
  qty numeric(10,3) default 1,
  unit_price numeric(12,2) default 0,
  base_total numeric(12,2) default 0,
  markup_pct numeric(6,3) default 0,
  total_with_markup numeric(12,2) default 0,
  category text
);

-- Payments
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id),
  customer_id uuid references customers(id),
  amount numeric(12,2) not null,
  status text default 'pending' check (status in ('pending','paid','overdue','partial')),
  due_date date,
  paid_date date,
  stripe_payment_id text,
  description text,
  notes text,
  created_at timestamptz default now()
);

-- Inspections
create table if not exists inspections (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id),
  inspector_name text,
  trade text,
  inspection_date date,
  items jsonb default '[]'::jsonb,
  matterport_url text,
  onedrive_url text,
  rilla_url text,
  notes text,
  created_at timestamptz default now()
);

-- Audit Records
create table if not exists audit_records (
  id uuid primary key default uuid_generate_v4(),
  job_id text,
  customer text,
  tech_name text,
  rilla_score int check (rilla_score between 0 and 100),
  talk_ratio int,
  open_questions int,
  duration_minutes int,
  outcome text,
  rilla_reviewed boolean default false,
  matterport_complete boolean default false,
  go3s_uploaded boolean default false,
  follow_up_sent boolean default false,
  quote_generated boolean default false,
  coaching_note text,
  created_at timestamptz default now()
);

-- updated_at trigger (safe to re-run)
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists jobs_updated_at on jobs;
create trigger jobs_updated_at before update on jobs
  for each row execute procedure update_updated_at();

drop trigger if exists quotes_updated_at on quotes;
create trigger quotes_updated_at before update on quotes
  for each row execute procedure update_updated_at();
