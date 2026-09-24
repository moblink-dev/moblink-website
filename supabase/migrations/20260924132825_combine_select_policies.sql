-- IRAAC-016: preserve the same row visibility with one SELECT policy per
-- database role and table. This avoids evaluating multiple permissive policies
-- for every authenticated service/referral read.

drop policy if exists "Published services are public" on public.services;
drop policy if exists "Active staff read all services" on public.services;

create policy "Anonymous reads published services"
  on public.services for select
  to anon
  using (status = 'published');

create policy "Authenticated read allowed services"
  on public.services for select
  to authenticated
  using (
    status = 'published'
    or exists (
      select 1
        from public.staff_profiles profile
       where profile.user_id = (select auth.uid())
         and profile.is_active = true
    )
  );

drop policy if exists "People read their own referrals" on public.referrals;
drop policy if exists "Active staff read all referrals" on public.referrals;

create policy "Authenticated read allowed referrals"
  on public.referrals for select
  to authenticated
  using (
    requester_user_id = (select auth.uid())
    or exists (
      select 1
        from public.staff_profiles profile
       where profile.user_id = (select auth.uid())
         and profile.is_active = true
    )
  );
