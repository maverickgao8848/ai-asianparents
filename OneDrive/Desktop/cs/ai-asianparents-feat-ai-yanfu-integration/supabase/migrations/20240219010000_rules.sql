-- Migration: create rules and rule_exceptions schema

create extension if not exists "pgcrypto";

create type public.week_day as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
create type public.rule_status as enum ('active', 'snoozed', 'archived');
create type public.rule_exception_kind as enum ('temporary_allow', 'emergency', 'scheduled_break');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_identifier text not null,
  app_display_name text,
  platform text check (platform in ('android', 'ios', 'web', 'other')),
  limit_minutes integer check (limit_minutes > 0),
  constraints jsonb not null default '{}'::jsonb,
  days_of_week week_day[] not null default array['mon','tue','wed','thu','fri','sat','sun']::week_day[],
  status rule_status not null default 'active',
  persona_key text not null default 'strict-father',
  reason_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger rules_set_updated_at
before update on public.rules
for each row execute procedure public.set_updated_at();

create index rules_user_id_idx on public.rules (user_id);
create index rules_status_idx on public.rules (status);

comment on table public.rules is 'Canonical screen-time rules per user and target application';

create table public.rule_exceptions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.rules(id) on delete cascade,
  kind rule_exception_kind not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.rule_exceptions
  add constraint rule_exceptions_time_window_check check (ends_at > starts_at);

create index rule_exceptions_rule_id_idx on public.rule_exceptions (rule_id);
create index rule_exceptions_window_idx on public.rule_exceptions using btree (starts_at, ends_at);

comment on table public.rule_exceptions is 'Approved exception windows for specific rules (temporary allowance, emergency etc.)';

alter table public.rules enable row level security;
alter table public.rule_exceptions enable row level security;

create policy "Users can manage own rules" on public.rules
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view linked rule exceptions" on public.rule_exceptions
  for select using (
    exists (
      select 1
      from public.rules r
      where r.id = rule_exceptions.rule_id
        and r.user_id = auth.uid()
    )
  );

create policy "Users can insert their own rule exceptions" on public.rule_exceptions
  for insert with check (
    exists (
      select 1
      from public.rules r
      where r.id = rule_exceptions.rule_id
        and r.user_id = auth.uid()
    )
  );

create policy "Users can manage their rule exceptions" on public.rule_exceptions
  for update using (
    exists (
      select 1
      from public.rules r
      where r.id = rule_exceptions.rule_id
        and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.rules r
      where r.id = rule_exceptions.rule_id
        and r.user_id = auth.uid()
    )
  );

create policy "Users can delete their rule exceptions" on public.rule_exceptions
  for delete using (
    exists (
      select 1
      from public.rules r
      where r.id = rule_exceptions.rule_id
        and r.user_id = auth.uid()
    )
  );
