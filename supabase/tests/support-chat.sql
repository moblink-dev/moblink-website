-- Run on a disposable database after the support migration; rolls back fixtures.
begin;
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
insert into public.support_conversations(id,team,customer_name,location,assistant_history) values
 ('10000000-0000-0000-0000-000000000001','moblink','Synthetic customer','Nowra','[{"role":"Customer","text":"Housing please"}]');
insert into public.support_messages(conversation_id,kind,body) values ('10000000-0000-0000-0000-000000000001','customer','Hello from a customer');
do $$ begin
  begin
    insert into public.support_messages(conversation_id,kind,body) values ('10000000-0000-0000-0000-000000000001','staff','Impersonation');
    raise exception 'FAIL customer impersonated staff';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.support_staff values ('00000000-0000-0000-0000-000000000001','moblink','Impersonation');
    raise exception 'FAIL customer granted self staff access';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  if (select count(*) from public.support_conversations) <> 0 then raise exception 'FAIL another customer sees chat'; end if;
  if (select count(*) from public.support_messages) <> 0 then raise exception 'FAIL another customer sees messages'; end if;
  begin
    insert into public.support_messages(conversation_id,kind,body) values ('10000000-0000-0000-0000-000000000001','customer','Intrusion');
    raise exception 'FAIL another customer writes chat';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
do $$ begin
  if (select count(*) from public.support_conversations) <> 0 then raise exception 'FAIL wrong team sees chat'; end if;
  begin
    insert into public.support_messages(conversation_id,kind,body) values ('10000000-0000-0000-0000-000000000001','staff','Wrong team');
    raise exception 'FAIL wrong team writes chat';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
do $$ begin
  if (select count(*) from public.support_conversations) <> 1 then raise exception 'FAIL assigned team cannot read'; end if;
end $$;
insert into public.support_messages(conversation_id,kind,body) values ('10000000-0000-0000-0000-000000000001','staff','Hello from a real staff session');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
  if (select count(*) from public.support_messages) <> 2 then raise exception 'FAIL customer cannot read staff reply'; end if;
  begin
    update public.support_conversations set team='iraac';
    raise exception 'FAIL customer reassigned team';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform * from public.support_conversations;
    raise exception 'FAIL unauthenticated access';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
