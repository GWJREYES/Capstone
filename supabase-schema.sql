-- CAPSTONE Field Operations Platform
-- Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers
create table customers (
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
create table subcontractors (
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
create table jobs (
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
create table quotes (
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
create table quote_line_items (
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
create table payments (
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
create table inspections (
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

-- Row Level Security (enable for production)
-- alter table jobs enable row level security;
-- alter table customers enable row level security;
-- alter table subcontractors enable row level security;
-- alter table quotes enable row level security;
-- alter table payments enable row level security;

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_updated_at before update on jobs
  for each row execute procedure update_updated_at();

create trigger quotes_updated_at before update on quotes
  for each row execute procedure update_updated_at();
