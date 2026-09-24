-- IRAAC-016: explicit cloud access boundary for the MobLink tables.
-- Existing migrations remain append-only; this migration replaces their
-- permissive prototype policies with authenticated ownership and staff rules.

-- Bind a referral to the authenticated person who created it. Existing rows
-- remain nullable and service-role workflows can still create governed rows.
alter table public.referrals
  add column if not exists requester_user_id uuid
  references auth.users(id) on delete set null
  default auth.uid();

create index if not exists idx_referrals_requester_user
  on public.referrals (requester_user_id);

create index if not exists support_messages_author
  on public.support_messages (author_id);

-- Remove policies from the early prototype, including the anonymous referral
-- insert. The replacement policies below are explicit about API roles.
drop policy if exists "Public can read published services" on public.services;
drop policy if exists "Authenticated users can read published services" on public.services;
drop policy if exists "Staff can read all services" on public.services;
drop policy if exists "Staff can insert services" on public.services;
drop policy if exists "Staff can update services" on public.services;
drop policy if exists "Staff can delete services" on public.services;

drop policy if exists "Users can read own referrals" on public.referrals;
drop policy if exists "Staff can read all referrals" on public.referrals;
drop policy if exists "Anyone can request help" on public.referrals;
drop policy if exists "Staff can update referrals" on public.referrals;

drop policy if exists "Staff can read own profile" on public.staff_profiles;
drop policy if exists "Admins can read all profiles" on public.staff_profiles;
drop policy if exists "Admins can create staff profiles" on public.staff_profiles;
drop policy if exists "Admins can update staff profiles" on public.staff_profiles;

revoke all on public.services, public.referrals, public.staff_profiles
  from anon, authenticated;

grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant select, insert, update on public.referrals to authenticated;
grant select on public.staff_profiles to authenticated;

create policy "Published services are public"
  on public.services for select
  to anon, authenticated
  using (status = 'published');

create policy "Active staff read all services"
  on public.services for select
  to authenticated
  using (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ));

create policy "Active staff create services"
  on public.services for insert
  to authenticated
  with check (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ));

create policy "Active staff update services"
  on public.services for update
  to authenticated
  using (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ))
  with check (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ));

create policy "Active staff delete services"
  on public.services for delete
  to authenticated
  using (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ));

create policy "People read their own referrals"
  on public.referrals for select
  to authenticated
  using (requester_user_id = (select auth.uid()));

create policy "People create their own referrals"
  on public.referrals for insert
  to authenticated
  with check (
    requester_user_id = (select auth.uid())
    and consent_to_follow_up = true
  );

create policy "Active staff read all referrals"
  on public.referrals for select
  to authenticated
  using (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ));

create policy "Active staff update referrals"
  on public.referrals for update
  to authenticated
  using (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ))
  with check (exists (
    select 1
      from public.staff_profiles profile
     where profile.user_id = (select auth.uid())
       and profile.is_active = true
  ));

create policy "Staff read their own profile"
  on public.staff_profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Fix the mutable search-path findings without changing function behaviour.
alter function public.update_updated_at()
  set search_path = pg_catalog, public;
alter function public.nearby_services(double precision, double precision, double precision, text, text)
  set search_path = pg_catalog, public, extensions;
alter function public.search_services_by_location(text, text)
  set search_path = pg_catalog, public, extensions;

-- Trigger helpers should never be directly callable through the Data API.
revoke execute on function public.update_updated_at()
  from public, anon, authenticated;
