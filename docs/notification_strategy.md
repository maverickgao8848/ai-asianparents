# Notification Strategy (T8)

## Channels
1. **Push Notifications (Primary)**
   - Provider: Expo Push Service (Expo Go + EAS builds).
   - Use `expo-server-sdk` from backend (Edge Function `dispatch-notifications`).
   - Store device push tokens per user in `user_devices` table with platform + last_seen.
2. **Transactional Email (Secondary)**
   - Provider: Resend.
   - Templates: `weekly_report`, `emergency_override_alert`, `streak_milestone`.
   - Locale-specific subject lines and copy; keep <120 chars.
3. **In-App Inbox (Fallback)**
   - Persist notifications in `notifications` table for users to review history.

## Data Model
```sql
create table public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('push', 'email', 'in_app')),
  payload jsonb not null,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
- `payload` example (push):
  ```json
  {
    "title": "本周总结已生成",
    "body": "严父本周共拦截 5 次，合规率 60%。看看复盘报告吧。",
    "data": {"type": "weekly_report", "report_id": "uuid"}
  }
  ```

## Workflow
1. Business logic enqueues notifications with `status='pending'`.
2. Edge Function `dispatch-notifications` runs every 5 minutes:
   - Fetch batch of `pending` rows where `next_attempt_at <= now()`.
   - For each row, send via appropriate provider.
   - On success → set `status='sent'` and update `notifications` table for in-app view.
   - On failure → increment `attempt_count`, apply exponential backoff (e.g., `next_attempt_at += 2^attempt_count minutes`), cap at 5 attempts before marking `status='failed'`.
3. In-app UI polls `notifications` table filtered by `status='sent'` to render feed/badges.

## Error Handling & Retries
- Push token invalid → remove token, mark queue item failed with `reason='invalid_token'`.
- Expo response `DeviceNotRegistered` → soft-delete device record.
- Resend failure → capture HTTP response, log to `notification_failures` table for audit.
- Backoff policy: 1m, 2m, 4m, 8m, 16m. After 5th failure escalate (optional email to support).

## Security & Privacy
- Store minimal payload in queue; avoid sensitive PII.
- For emails, include unsubscribe/manage settings link (future).
- Use Supabase RLS to ensure users only read their notifications.

## Configuration & Secrets
- Environment variables:
  - `EXPO_ACCESS_TOKEN` (already in `.env.local.example`).
  - `RESEND_API_KEY`.
  - `NOTIFICATION_BATCH_SIZE` (default 100).
- Store provider-specific metadata (e.g., Resend template IDs) in `packages/config/notifications.ts` for reuse.

## Monitoring
- Metrics: queue length, failure rate, delivery latency.
- Logging: push message ID, email ID; correlate with weekly report generation IDs.
- Alert when `status='failed'` > 20% in last hour.

## Testing Strategy
- Unit tests: queue consumer logic (simulate success/failure/backoff).
- Integration tests: stub Expo/Resend HTTP responses.
- Manual test plan: use staging environment with Expo tokens, verify bilingual templates.

## Next Steps
- Add SQL migration for `notification_queue` and `notifications` tables.
- Implement `dispatch-notifications` Edge Function with provider adapters.
- Build settings UI for users to opt-in/out of channels.
