# Emergency Override Flow (T10)

## Goals
- Allow genuine emergencies while preserving accountability.
- Capture context (reason, evidence) and enforce cooldown to prevent abuse.
- Integrate with interception dialog and weekly analytics.

## User Journey
1. During interception, user taps `紧急情况` button.
2. Modal sheet prompts for:
   - Required reason text (≥ 15 chars).
   - Optional contact note (e.g., notify accountability partner later).
   - Checkbox "愿意接受事后复盘" (defaults true).
3. On submit:
   - Immediate unlock granted (bypass AI debate).
   - Entry logged with `user_decision='emergency'`, `emergency_flag=true`.
   - Cooldown activated preventing another emergency override for `EMERGENCY_COOLDOWN_MINUTES` (default 180).
4. Follow-up notification after cooldown asking user to confirm outcome (links to quick check-in form).

## Backend Requirements
- Extend `interceptions` table usage with `emergency_flag` (already added) and additional metadata column in `interception_entries` to store `emergency_details` (reason, contact, consent).
- New table `emergency_overrides` for auditing:
  ```sql
  create table public.emergency_overrides (
    id uuid primary key default gen_random_uuid(),
    interception_id uuid references public.interceptions(id) on delete cascade,
    user_id uuid not null,
    reason text not null,
    contact_note text,
    follow_up_required boolean not null default true,
    created_at timestamptz default now()
  );
  ```
- Supabase Edge Function `emergency-override`:
  - Validates cooldown (no more than 2 emergency overrides per rolling 7 days, minimum 3 hours between).
  - Persists records; returns unlock token to client.
  - Schedules follow-up notification (enqueue message).

## Rate Limits & Policies
- Soft limit: max 2 emergencies in 7 days. Additional attempts require AI verification (LLM prompt asking for evidence) or escalate to manual review.
- Hard cooldown: 180 minutes. Attempting within cooldown shows message "刚刚触发过紧急解锁，请先完成当前任务或联系支持".
- System tracks `emergency_flag` per `interceptions` for analytics.

## UX Copy Guidelines (per persona)
- Strict Father: "紧急情况要说清楚。我会记录这次特殊处理。"
- Rational Mentor: "请描述事件。系统会在 3 小时后提醒你复盘。"
- Humor Coach: "好的，这次真·紧急？记得回来告诉我结果，不然下次不给特权哦！"

## Analytics & Reporting
- Weekly report highlights emergency count & reasons.
- Dashboard metric: emergency rate per active user.
- Trigger alert if emergency overrides > 3 per user per month.

## Follow-up Flow
- After cooldown, send push notification + in-app task: "请确认紧急事件是否完成".
- User completes quick check-in (yes/no + optional notes). Store result in `emergency_followups` table for accountability.

## Security & Abuse Prevention
- All emergency reasons stored with user consent; allow users to delete history.
- Optional feature: require selfie or OTP for high-risk overrides (backlog).
- Log IP/device info for pattern detection.

## Next Steps
- Add SQL migrations for `emergency_overrides` (and follow-up table if needed).
- Implement `emergency-override` Edge Function with cooldown logic.
- Update mobile UI to reflect cooldown state and follow-up reminders.
