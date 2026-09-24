-- Service directory table for the 1800 Mob Link service connector
-- Each service has a location stored as a PostGIS geography point for distance queries

create type service_status as enum ('draft', 'review', 'published', 'inactive');
create type service_category as enum (
  'Crisis', 'Health', 'Legal', 'Housing', 'Family', 'Youth',
  'Culture', 'Education', 'Employment', 'Centrelink', 'Financial',
  'Mental Health', 'Addiction', 'Elderly', 'Disability'
);

create table public.services (
  id              uuid primary key default gen_random_uuid(),
  -- Core identity
  name            text not null,
  category        service_category not null,
  subcategory     text not null default '',
  tags            text[] not null default '{}',
  description     text not null default '',
  -- Location
  address         text not null default '',
  suburb          text not null default '',
  state           text not null default 'NSW',
  postcode        text not null default '',
  location        geography(point, 4326),  -- PostGIS spatial point
  -- Contact
  phone           text not null default '',
  website         text not null default '',
  hours           text not null default '',
  eligibility     text not null default '',
  -- Flags
  is_aboriginal_led boolean not null default false,
  is_crisis         boolean not null default false,
  is_national       boolean not null default false,
  is_free           boolean not null default false,
  -- Status and provenance
  status          service_status not null default 'draft',
  source          text not null default '',
  source_url      text not null default '',
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users(id) on delete set null,
  -- Metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Enable RLS
alter table public.services enable row level security;

-- Indexes
create index idx_services_location on public.services using gist (location);
create index idx_services_category on public.services (category);
create index idx_services_status on public.services (status);
create index idx_services_suburb on public.services (suburb);
create index idx_services_name_trgm on public.services using gin (name gin_trgm_ops);
create index idx_services_description_trgm on public.services using gin (description gin_trgm_ops);

-- RLS policies
-- Public: can read published services only
create policy "Public can read published services"
  on public.services for select
  using (status = 'published');

-- Authenticated community users: can read published services
create policy "Authenticated users can read published services"
  on public.services for select
  to authenticated
  using (status = 'published');

-- Staff policies are installed by the later cloud-access hardening migration,
-- after public.staff_profiles exists. Keeping that dependency out of this
-- migration allows a clean database to rebuild in timestamp order.

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.update_updated_at();
