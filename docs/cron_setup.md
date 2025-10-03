# Supabase Cron Setup

## Overview
We rely on Supabase scheduled functions to automate:
- Weekly report generation (`generate-weekly-report`)
- Notification dispatch (`dispatch-notifications`)

Both functions can be scheduled via the Supabase CLI (requires `supabase` v1.153+). The commands below assume the project is already linked (`supabase link`).

## Prerequisites
1. Set environment variables in Supabase project secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_ACCESS_TOKEN` (for Expo push)
   - `RESEND_API_KEY` (for email)
2. Deploy Edge Functions:
   ```bash
   supabase functions deploy generate-weekly-report
   supabase functions deploy dispatch-notifications
   ```

## Schedule Weekly Report Generator
- Goal: run every Monday 07:00 local time (server uses UTC).
- Example command (UTC cron for Monday 23:00 = Tuesday 07:00 UTC+8):
  ```bash
  supabase functions schedule create generate-weekly-report \
    --cron "0 23 * * 0" \
    --payload '{"limit": 100}'
  ```
  Adjust cron expression per target timezone.

## Schedule Notification Dispatcher
- Goal: run every 5 minutes to process queue.
  ```bash
  supabase functions schedule create dispatch-notifications \
    --cron "*/5 * * * *" \
    --payload '{"limit": 100}'
  ```

## Managing Schedules
- List existing schedules:
  ```bash
  supabase functions schedule list
  ```
- Update schedule payload or cron:
  ```bash
  supabase functions schedule update generate-weekly-report \
    --cron "0 0 * * 1" \
    --payload '{"limit": 200}'
  ```
- Delete schedule:
  ```bash
  supabase functions schedule delete dispatch-notifications
  ```

## Monitoring & Logs
- Use Supabase dashboard → Edge Functions → Logs to verify successful executions.
- Add application-level logging in the functions (already outputs fallback messages when credentials missing).
- Consider creating a Slack/email alert for consecutive failures (future task).

## Manual Verification Checklist
1. Run `supabase functions invoke generate-weekly-report --local` with mocked payload to ensure successful response.
2. After schedule creation, wait for next tick and confirm new entries in `weekly_reports`.
3. Ensure `notification_queue` drains after `dispatch-notifications` run.

## Next Steps
- Integrate schedule creation into an infra script or GitHub Action (#infra backlog).
- Add metrics dashboard summarizing cron success/failure counts.
