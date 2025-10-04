-- Migration: interception logging tables

create type public.interception_trigger as enum ('quota_exceeded', 'blocked_window', 'cooldown_active');
create type public.ai_verdict as enum ('deny', 'delay', 'allow');
create type public.user_decision as enum ('comply', 'override', 'emergency');
create type public.reason_category as enum ('work', 'study', 'health', 'mental_break', 'social', 'emergency', 'other');

create table public.override_reasons (
  id serial primary key,
  category reason_category not null,
  label text not null,
  locale text not null default 'zh-CN'
);

insert into public.override_reasons (category, label) values
  ('work', '加班/工作任务'),
  ('study', '学习/考试需求'),
  ('health', '健康相关'),
  ('mental_break', '放松/休息'),
  ('social', '社交沟通'),
  ('emergency', '紧急情况'),
  ('other', '其他');

create table public.interceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid not null references public.rules(id) on delete cascade,
  persona_key text not null,
  trigger interception_trigger not null,
  streak integer not null default 0,
  override_count_today integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  final_ai_verdict ai_verdict,
  final_decision user_decision,
  final_reason_category reason_category,
  appeal_used boolean not null default false,
  emergency_flag boolean not null default false
);

create trigger interceptions_set_updated_at
before update on public.interceptions
for each row execute procedure public.set_updated_at();

create index interceptions_user_id_idx on public.interceptions (user_id, created_at desc);
create index interceptions_rule_id_idx on public.interceptions (rule_id);

comment on table public.interceptions is 'Interception sessions triggered when user attempts to bypass a rule.';

create table public.interception_entries (
  id uuid primary key default gen_random_uuid(),
  interception_id uuid not null references public.interceptions(id) on delete cascade,
  turn integer not null,
  user_reason text,
  reason_category reason_category,
  ai_verdict ai_verdict,
  ai_confidence numeric(3,2),
  persona_response text,
  user_decision user_decision,
  created_at timestamptz not null default now()
);

alter table public.interception_entries
  add constraint interception_entries_turn_check check (turn >= 1);

create index interception_entries_interception_idx on public.interception_entries (interception_id, turn);

comment on table public.interception_entries is 'Detailed turn-by-turn log for each interception session.';

alter table public.override_reasons enable row level security;
alter table public.interceptions enable row level security;
alter table public.interception_entries enable row level security;

create policy "Override reasons readable" on public.override_reasons
  for select using (true);

create policy "Users manage own interceptions" on public.interceptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users view their interception entries" on public.interception_entries
  for select using (
    exists (
      select 1 from public.interceptions i
      where i.id = interception_entries.interception_id
        and i.user_id = auth.uid()
    )
  );

create policy "Users insert their interception entries" on public.interception_entries
  for insert with check (
    exists (
      select 1 from public.interceptions i
      where i.id = interception_entries.interception_id
        and i.user_id = auth.uid()
    )
  );

create policy "Users update their interception entries" on public.interception_entries
  for update using (
    exists (
      select 1 from public.interceptions i
      where i.id = interception_entries.interception_id
        and i.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.interceptions i
      where i.id = interception_entries.interception_id
        and i.user_id = auth.uid()
    )
  );

create policy "Users delete their interception entries" on public.interception_entries
  for delete using (
    exists (
      select 1 from public.interceptions i
      where i.id = interception_entries.interception_id
        and i.user_id = auth.uid()
    )
  );
