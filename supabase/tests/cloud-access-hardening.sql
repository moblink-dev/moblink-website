-- IRAAC-016: metadata checks for least-privilege cloud access.

begin;
create extension if not exists pgtap;
select plan(32);

select has_column('public', 'referrals', 'requester_user_id',
  'referrals are bound to an authenticated owner');
select has_column('public', 'referrals', 'client_service_key',
  'referrals retain the selected service key');
select has_column('public', 'referrals', 'postcode',
  'referrals retain the supplied postcode');
select has_column('public', 'referrals', 'preferred_contact',
  'referrals retain the preferred contact channel');

select policies_are('public', 'services', array[
  'Active staff create services',
  'Active staff delete services',
  'Active staff update services',
  'Anonymous reads published services',
  'Authenticated read allowed services'
], 'services expose only the reviewed policies');

select policies_are('public', 'referrals', array[
  'Active staff update referrals',
  'Authenticated read allowed referrals',
  'People create their own referrals'
], 'referrals expose only owner and staff policies');

select policies_are('public', 'staff_profiles', array[
  'Staff read their own profile'
], 'staff profiles are directly readable only by their owner');

select ok(has_table_privilege('anon', 'public.services', 'select'),
  'anon can query the public service directory');
select ok(not has_table_privilege('anon', 'public.services', 'insert'),
  'anon cannot create services');
select ok(not has_table_privilege('anon', 'public.referrals', 'insert'),
  'anon cannot submit a referral containing personal data');
select ok(has_table_privilege('authenticated', 'public.referrals', 'insert'),
  'authenticated users can create an owned referral');
select ok(not has_table_privilege('authenticated', 'public.staff_profiles', 'update'),
  'staff cannot edit their own role or active state');

select ok(
  not has_function_privilege('anon', 'public.update_updated_at()', 'execute'),
  'anon cannot execute the timestamp trigger helper'
);
select ok(
  not has_function_privilege('authenticated', 'public.update_updated_at()', 'execute'),
  'authenticated cannot execute the timestamp trigger helper'
);

select is(
  (select proconfig::text from pg_proc
    where oid = 'public.nearby_services(double precision,double precision,double precision,text,text)'::regprocedure),
  '{"search_path=pg_catalog, public, extensions"}'::text,
  'nearby service search has a fixed search path'
);
select is(
  (select proconfig::text from pg_proc
    where oid = 'public.search_services_by_location(text,text)'::regprocedure),
  '{"search_path=pg_catalog, public, extensions"}'::text,
  'location search has a fixed search path'
);

-- Behavioural RLS proof with synthetic identities.
insert into auth.users(id) values
  ('20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003');

insert into public.staff_profiles(user_id, email, display_name, role, is_active)
values ('20000000-0000-0000-0000-000000000003', 'staff@example.invalid', 'Synthetic staff', 'viewer', true);

insert into public.services(id, name, category, status) values
  ('21000000-0000-0000-0000-000000000001', 'Synthetic published service', 'Housing', 'published'),
  ('21000000-0000-0000-0000-000000000002', 'Synthetic draft service', 'Housing', 'draft');

set local role anon;
select is((select count(*) from public.services), 1::bigint,
  'anon sees only published services');
select throws_ok(
  $$insert into public.services(name, category) values ('Anonymous service', 'Housing')$$,
  null, null, 'anon cannot create a service'
);

set local role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.services), 1::bigint,
  'ordinary authenticated users see only published services');
select is((select count(*) from public.services where status = 'draft'), 0::bigint,
  'ordinary authenticated users cannot see draft services');
select throws_ok(
  $$insert into public.services(name, category) values ('Unapproved service', 'Housing')$$,
  null, null, 'ordinary authenticated users cannot create services'
);
select lives_ok(
  $$insert into public.referrals(requester_name, requester_phone, service_name, consent_to_follow_up)
    values ('Synthetic owner', '0400000000', 'Synthetic published service', true)$$,
  'authenticated user creates an owned consented referral'
);
select is((select count(*) from public.referrals), 1::bigint,
  'authenticated user reads only their own referral');
select throws_ok(
  $$insert into public.referrals(requester_name, requester_phone, service_name, consent_to_follow_up)
    values ('No consent', '0400000001', 'Synthetic published service', false)$$,
  null, null, 'referral creation requires follow-up consent'
);
select throws_ok(
  $$update public.staff_profiles set role = 'admin' where user_id = '20000000-0000-0000-0000-000000000003'$$,
  null, null, 'ordinary users cannot change a staff role'
);

select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.referrals), 0::bigint,
  'another authenticated user cannot read the referral');

select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.services), 2::bigint,
  'active staff can read published and draft services');
select lives_ok(
  $$insert into public.services(name, category, status) values ('Staff service', 'Housing', 'draft')$$,
  'active staff can create a service'
);
select is((select count(*) from public.referrals), 1::bigint,
  'active staff can read referrals');
select lives_ok(
  $$update public.referrals set status = 'triage'$$,
  'active staff can update referrals'
);
select is((select count(*) from public.staff_profiles), 1::bigint,
  'staff can read their own profile');

select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.staff_profiles), 0::bigint,
  'ordinary users cannot read another person staff profile');

select * from finish();
rollback;
