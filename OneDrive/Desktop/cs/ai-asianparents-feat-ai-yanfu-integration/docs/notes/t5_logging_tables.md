# T5 Notes – Interception Logging Schema

## Requirements Recap
- Capture each interception exchange with verdict, reason, persona response.
- Support analytics (weekly reports, excuse trends, compliance rate).
- Retain emergency overrides with separate flag.
- Maintain retention policy (e.g., 180 days) while keeping aggregate stats.

## Table Concepts
- `interceptions`: top-level session triggered by rule break.
- `interception_entries`: each message pair (user reason + AI response).
- `override_reasons`: normalized dictionary for tagging (work, study, emergency, etc.).
- `interception_metrics`: optional materialized view for daily aggregates (later).

## Retention Plan
- Keep detailed entries for 180 days, then archive summary (counts, categories) to cold storage (future).
- Supabase cron to delete rows older than retention while preserving aggregates.
