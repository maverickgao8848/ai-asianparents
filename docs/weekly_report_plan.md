# Weekly Report Workflow (T7)

## Objectives
- Provide users with actionable weekly summaries covering focus performance, excuses, and improvements.
- Automate report generation via Supabase Edge Functions + cron triggers.
- Support multi-channel delivery: in-app digest, push notification, optional email (Resend).

## Data Inputs
- `rules`, `interceptions`, `interception_entries`, `override_reasons`, `weekly_reports` (new table).
- Derived metrics per user/week (ISO week, timezone-aware):
  - Total screen time per monitored app (from `rules` + on-device telemetry placeholder).
  - Interception attempts count, compliance vs override ratio.
  - Top `reason_category` with representative quotes.
  - Streak info (longest streak of compliance).

## Architecture
1. **Edge Function `generate-weekly-report`**
   - Runs on Supabase scheduled job every Monday 07:00 local timezone.
   - Batched per user (process 100 users per invocation; cursor-based to avoid timeouts).
   - Steps:
     1. Fetch last week data slice.
     2. Aggregate metrics via SQL queries (use Supabase RPC or direct queries with `supabase-js`).
     3. Summarize reasons (top categories, sample reason text <=120 chars).
     4. Compose recommendation block using heuristic + optional LLM mini prompt (gpt-4o-mini) for personalized nudge.
     5. Insert record into `weekly_reports` table.
     6. Trigger notification queue (push/email).
2. **Notification Handler**
   - Use Supabase queue table or direct calls to Expo Push / Resend with exponential backoff.
   - In-app feed draws from `weekly_reports`.

## Database Additions
- `weekly_reports` table structure:
  ```sql
  create table public.weekly_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    week_start date not null,
    week_end date not null,
    timezone text not null,
    payload jsonb not null,
    created_at timestamptz default now(),
    notification_status text not null default 'pending'
  );
  ```
- Index on `(user_id, week_start)` for fast lookups.
- Store summarized metrics in `payload`:
  ```json
  {
    "apps": [{"app_identifier": "com.zhiliaoapp.musically", "total_minutes": 120, "overrides": 2}],
    "interceptions": {"attempts": 5, "compliance_rate": 0.6},
    "top_reasons": [{"category": "work", "count": 3, "sample": "今晚有紧急会议"}],
    "streak": {"current": 4, "longest": 7},
    "recommendation": "下周尝试把娱乐时间提前到 21:30 之前。"
  }
  ```

## Scheduling & Scalability
- Use Supabase Cron (beta) with job `weekly-report-generator` running `generate-weekly-report` daily with `?batch=1` to process segments.
- Function should accept query params `?cursor=last_user_id` to paginate.
- Timeout per invocation: 60s; target < 10s.
- Implement idempotency: skip if report already exists for `(user_id, week_start)`.

## LLM Usage
- Optional: call `ai-debate` service with condensed user metrics to produce `recommendation` copy.
- Keep summary under 120 characters, persona-aligned tone (strict father still supportive).
- Cache recommendation string in report payload to avoid repeat charges.

## Notification Flow
1. After inserting `weekly_reports`, add row to `notification_queue` table with channels (`push`, `email`).
2. Separate Edge Function `dispatch-notifications` runs every 5 minutes to process queue:
   - Push: Expo push tokens from profile; if fail, set status `retry` with exponential backoff.
   - Email: Resend template `weekly_report` with dynamic data.
3. In-app digest screen fetches latest `weekly_reports` entry on login.

## Testing Plan
- Unit tests for aggregation SQL (using Supabase local testing or jest + pg mock).
- Deno tests for `generate-weekly-report` function with fixture data.
- Snapshot tests for email template (MJML/React Email) verifying copy.
- Integration test verifying cron invocation updates `notification_status` to `sent`.

## Monitoring & Analytics
- Track metrics: reports generated per batch, failure rate, average generation time.
- Alert if generation fails consecutively for same user (2 weeks).
- Provide admin dashboard metrics (future): compliance trends, top excuses network-wide.

## Next Steps
- Create SQL migration for `weekly_reports` + `notification_queue` tables.
- Implement `generate-weekly-report` Edge Function and tests.
- Build in-app weekly digest screen hooking into `weekly_reports` payload.
