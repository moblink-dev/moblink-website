-- Separate from the public fictional CRM. Membership is provisioned by an admin.
create table public.support_staff (
  user_id uuid not null references auth.users(id) on delete cascade,
  team text not null check (team in ('moblink', 'iraac')),
  display_name text not null check (length(display_name) between 1 and 100),
  primary key(user_id, team)
);
create table public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  team text not null check (team in ('moblink', 'iraac')),
  customer_name text not null check (length(customer_name) between 1 and 100),
  location text not null default '' check (length(location) <= 200),
  assistant_history jsonb not null default '[]' check (jsonb_typeof(assistant_history) = 'array' and octet_length(assistant_history::text) <= 200000),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id),
  kind text not null check (kind in ('customer', 'staff')),
  body text not null check (length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index support_conversations_customer on public.support_conversations(customer_id, team);
create index support_conversations_team on public.support_conversations(team, created_at);
create index support_messages_conversation on public.support_messages(conversation_id, created_at);

alter table public.support_staff enable row level security;
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
revoke all on public.support_staff, public.support_conversations, public.support_messages from anon, authenticated;
grant select on public.support_staff to authenticated;
grant select on public.support_conversations, public.support_messages to authenticated;
grant insert (id, customer_id, team, customer_name, location, assistant_history) on public.support_conversations to authenticated;
grant insert (id, conversation_id, author_id, kind, body) on public.support_messages to authenticated;

create policy "Staff can see their own membership" on public.support_staff for select to authenticated using (user_id = (select auth.uid()));
create policy "Customers and assigned teams can read chats" on public.support_conversations for select to authenticated using (
  customer_id = (select auth.uid()) or exists (select 1 from public.support_staff s where s.user_id = (select auth.uid()) and s.team = support_conversations.team)
);
create policy "Customers open their own chats" on public.support_conversations for insert to authenticated with check (
  customer_id = (select auth.uid()) and not exists (select 1 from public.support_staff s where s.user_id = (select auth.uid()))
);
create policy "Participants can read messages" on public.support_messages for select to authenticated using (
  exists (select 1 from public.support_conversations c where c.id = conversation_id)
);
create policy "Participants send only as themselves" on public.support_messages for insert to authenticated with check (
  author_id = (select auth.uid()) and exists (
    select 1 from public.support_conversations c where c.id = conversation_id and (
      (kind = 'customer' and c.customer_id = (select auth.uid())) or
      (kind = 'staff' and c.customer_id <> (select auth.uid()) and exists (select 1 from public.support_staff s where s.user_id = (select auth.uid()) and s.team = c.team))
    )
  )
);
