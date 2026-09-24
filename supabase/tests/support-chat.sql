-- Authenticated support-chat RLS proof. All fixtures are synthetic and rolled
-- back so this can run through `supabase test db` on a disposable database.
begin;
create extension if not exists pgtap;
select plan(14);

insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
insert into public.support_staff values
 ('00000000-0000-0000-0000-000000000003','moblink','Test MobLink staff'),
 ('00000000-0000-0000-0000-000000000004','iraac','Test IRAAC staff');

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select lives_ok(
  $$insert into public.support_conversations(id,team,customer_name,location,assistant_history) values
    ('10000000-0000-0000-0000-000000000001','moblink','Synthetic customer','Nowra','[{"role":"Customer","text":"Housing please"}]')$$,
  'customer opens their own conversation'
);
select lives_ok(
  $$insert into public.support_messages(conversation_id,kind,body) values
    ('10000000-0000-0000-0000-000000000001','customer','Hello from a customer')$$,
  'customer writes to their own conversation'
);
select throws_ok(
  $$insert into public.support_messages(conversation_id,kind,body) values
    ('10000000-0000-0000-0000-000000000001','staff','Impersonation')$$,
  null, null, 'customer cannot impersonate staff'
);
select throws_ok(
  $$insert into public.support_staff values
    ('00000000-0000-0000-0000-000000000001','moblink','Impersonation')$$,
  null, null, 'customer cannot grant staff access'
);

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.support_conversations), 0::bigint,
  'another customer cannot see the conversation');
select is((select count(*) from public.support_messages), 0::bigint,
  'another customer cannot see messages');
select throws_ok(
  $$insert into public.support_messages(conversation_id,kind,body) values
    ('10000000-0000-0000-0000-000000000001','customer','Intrusion')$$,
  null, null, 'another customer cannot write to the conversation'
);

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
select is((select count(*) from public.support_conversations), 0::bigint,
  'staff from the wrong team cannot see the conversation');
select throws_ok(
  $$insert into public.support_messages(conversation_id,kind,body) values
    ('10000000-0000-0000-0000-000000000001','staff','Wrong team')$$,
  null, null, 'staff from the wrong team cannot reply'
);

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.support_conversations), 1::bigint,
  'assigned team can read the conversation');
select lives_ok(
  $$insert into public.support_messages(conversation_id,kind,body) values
    ('10000000-0000-0000-0000-000000000001','staff','Hello from a real staff session')$$,
  'assigned team can reply'
);

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.support_messages), 2::bigint,
  'customer can read the staff reply');
select throws_ok(
  $$update public.support_conversations set team='iraac'$$,
  null, null, 'customer cannot reassign the team'
);

reset role;
set local role anon;
select throws_ok(
  $$select * from public.support_conversations$$,
  null, null, 'unauthenticated callers cannot read support conversations'
);

select * from finish();
rollback;
