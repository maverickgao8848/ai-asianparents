-- Migration: weekly reports, notifications, emergency overrides

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  timezone text not null,
  payload jsonb not null,
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reports_unique_week unique (user_id, week_start)
);

create trigger weekly_reports_set_updated_at
before update on public.weekly_reports
for each row execute procedure public.set_updated_at();

create index weekly_reports_user_week_idx on public.weekly_reports (user_id, week_start desc);

comment on table public.weekly_reports is 'Aggregated weekly summaries for each user, powering in-app digest and emails.';

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('push', 'email', 'in_app')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'retry')),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_queue_set_updated_at
before update on public.notification_queue
for each row execute procedure public.set_updated_at();

create index notification_queue_status_idx on public.notification_queue (status, next_attempt_at);

comment on table public.notification_queue is 'Pending notification jobs for push/email/in-app channels with retry metadata.';

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

comment on table public.notifications is 'In-app notification feed for users.';

create table if not exists public.emergency_overrides (
  id uuid primary key default gen_random_uuid(),
  interception_id uuid references public.interceptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  contact_note text,
  follow_up_required boolean not null default true,
  created_at timestamptz not null default now()
);

create index emergency_overrides_user_idx on public.emergency_overrides (user_id, created_at desc);

comment on table public.emergency_overrides is 'Audit log for emergency unlocks including stated reason and follow-up preference.';

create table if not exists public.emergency_followups (
  id uuid primary key default gen_random_uuid(),
  emergency_override_id uuid not null references public.emergency_overrides(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'completed', 'skipped')),
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index emergency_followups_status_idx on public.emergency_followups (status);

comment on table public.emergency_followups is 'Tracks follow-up confirmations after emergency overrides.';

-- RLS policies
alter table public.weekly_reports enable row level security;
alter table public.notification_queue enable row level security;
alter table public.notifications enable row level security;
alter table public.emergency_overrides enable row level security;
alter table public.emergency_followups enable row level security;

create policy "Users read own weekly reports" on public.weekly_reports
  for select using (auth.uid() = user_id);
create policy "Users insert weekly reports" on public.weekly_reports
  for insert with check (auth.uid() = user_id);
create policy "Service writes weekly reports" on public.weekly_reports
  for insert with check (auth.role() = 'service_role');

create policy "Notifications queue managed by service" on public.notification_queue
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users update notification read marker" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Service inserts notifications" on public.notifications
  for insert with check (auth.role() = 'service_role');

create policy "Users manage own emergency overrides" on public.emergency_overrides
  for select using (auth.uid() = user_id);
create policy "Service inserts emergency overrides" on public.emergency_overrides
  for insert with check (auth.role() = 'service_role');

create policy "Users view followup" on public.emergency_followups
  for select using (auth.uid() = user_id);
create policy "Users update followup" on public.emergency_followups
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Service inserts followup" on public.emergency_followups
  for insert with check (auth.role() = 'service_role');
