-- Referrals table for tracking community member help requests
-- Each referral links a community member to a service they requested help with

create type referral_status as enum (
  'requested', 'triage', 'referred', 'follow_up_due',
  'resolved', 'could_not_connect', 'escalated', 'withdrawn'
);

create table public.referrals (
  id              uuid primary key default gen_random_uuid(),
  -- Who requested
  requester_name    text not null,
  requester_phone   text not null,
  requester_email   text not null default '',
  -- What they need
  service_id        uuid references public.services(id) on delete set null,
  service_name      text not null,
  service_category  text not null default '',
  need_category     text not null default 'Other',
  message           text not null default '',
  -- Consent
  consent_to_follow_up boolean not null default false,
  -- Status
  status            referral_status not null default 'requested',
  staff_notes       text not null default '',
  -- Assigned staff
  assigned_to       uuid references auth.users(id) on delete set null,
  -- Timeline
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  triaged_at        timestamptz,
  referred_at       timestamptz,
  resolved_at       timestamptz
);

-- Enable RLS
alter table public.referrals enable row level security;

-- Indexes
create index idx_referrals_status on public.referrals (status);
create index idx_referrals_service on public.referrals (service_id);
create index idx_referrals_created on public.referrals (created_at desc);
create index idx_referrals_assigned on public.referrals (assigned_to);

-- RLS policies
-- Community users: can read their own referrals (by phone)
create policy "Users can read own referrals"
  on public.referrals for select
  to authenticated
  using (requester_phone = auth.jwt()->>'phone');

-- Anyone can insert a referral (public form)
create policy "Anyone can request help"
  on public.referrals for insert
  with check (true);

-- Staff policies are installed by the later cloud-access hardening migration,
-- after public.staff_profiles exists.

-- Auto-update updated_at
create trigger trg_referrals_updated_at
  before update on public.referrals
  for each row execute function public.update_updated_at();
