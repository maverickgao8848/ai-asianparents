# T1 – Rule Schema Notes

## Requirements Recap
- Rules are user-specific and target an app bundle or category.
- Need to store duration caps and optional blocked windows (e.g., 21:00-23:00).
- Support weekly cadence (days of week) and persona alignment for messaging.
- Exceptions cover temporary allowances (e.g., study break) and emergency unlocks with metadata.

## Design Decisions
- `rules` table holds the canonical policy, JSON column `constraints` retains parsed natural-language fields for flexibility.
- `days_of_week` stored as array using enum type `week_day`.
- `rule_exceptions` references `rules`, tracks window plus metadata for auditing.
- `status` enum expresses active/snoozed/archived states for quick toggles.
- `constraints` JSON keeps structured payload (`time_windows`, `daily_quota_minutes`, `cooldown_minutes`).
- Row Level Security enabled; policy ensures users only access their rows.
