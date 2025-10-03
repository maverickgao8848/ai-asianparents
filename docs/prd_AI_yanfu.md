# AI 严父 — Product Requirements Document (Phase 0)

## Vision Snapshot
Build a mobile-first digital health companion that helps users confront their phone overuse by debating with a strict-but-fair AI guardian before granting exceptions, keeping every feature lean and iteration-friendly.

- **Guiding principles (config alignment):** ship an MVP fast, lean on managed services (Supabase, Auth, cloud LLM APIs), keep flows minimal, and store secrets in environment variables.
- **Consulted agents:** `ux-researcher` for behavior insights, `brand-guardian` for tone/visual guardrails, `ui-designer` for mobile-first component guidance.

## Goals (first 6-week runway)
1. Help users reduce daily phone unlocks and limit high-distraction apps without brute-force blocking.
2. Capture and surface the real reasons behind “rule breaks” to drive self-awareness.
3. Deliver a personality-driven AI “严父” experience that feels authoritative yet fair, reinforcing the brand tone every session.
4. Produce weekly insight reports that close the loop and nudge healthier device habits.

## Target Segments & Personas
- **Focused Student ("Li Wei", 19)**
  - Crams for exams, TikTok scrolls past midnight.
  - Needs gentle enforcement during study blocks; values credibility and quick override for emergencies.
  - Success metric: 30% fewer midnight unlocks, consistent study sessions.
- **Distracted Professional ("Chen Qiao", 28)**
  - Remote PM; Slack, WeChat, and short videos fracture focus.
  - Wants configurable work-hour rules and respectful tone; tolerates paternal coaching if logical.
  - Success metric: 2 uninterrupted deep-work blocks per workday.
- **Aspirational Creator ("Zhang Yu", 32)**
  - Side-hustle content creator; oscillates between creation and doomscrolling.
  - Needs weekly reflections, trend-tagged excuses, and mood-aware encouragement.
  - Success metric: 3 published posts/week with limited “doomscroll” debt.

## Problem & Value Proposition
- **Problem:** Current screen-time apps rely on passive counters or hard locks, letting users rationalize overrides without reflection.
- **Value:** AI 严父 forces a conversational checkpoint that records excuses, challenges weak logic, and coaches better decisions, translating self-awareness into measurable habit change.

## MVP Feature Scope (priority ordered)
1. **Natural-language rule intake → structured policy builder**
   - Parse inputs like “Weekdays 9-18 WeChat ≤ 30 min” into JSON rules (app_id, duration, time window, exceptions).
   - Store in Supabase; expose via mobile UI (React Native/Expo).
2. **严父 interception dialog (LLM-driven)**
   - Trigger on attempted rule break; present persona-specific prompt chain.
   - Allow user to argue; AI evaluates rationale using rules + history, returns Allow/Deny/Delay recommendation.
3. **Override logging & tagging**
   - Persist every attempted break with reason, AI verdict, user final decision (comply / override / emergency).
   - Tag excuses (e.g., “work”, “boredom”) using lightweight classification.
4. **Weekly insight report (in-app digest + email)**
   - Summaries: total screen time per rule, break count, top excuses, AI suggestions.
   - Generate via scheduled Supabase Edge function / Cron.
5. **Persona presets & tone control**
   - Ship 3 personalities (严父, 理性导师, 幽默教练) with adjustable tone strings and microcopy.
6. **Emergency override flow**
   - “紧急情况” path requiring reason; flag in logs; limit frequency; optional contact note.

> Out-of-scope for MVP: voice interface, multiplayer accountability, advanced emotion detection, cross-device desktop clients. Keep backlog tagged.

## Core User Flows
1. **Onboarding & Rule Creation**
   - Sign in (Supabase Auth → magic link or OAuth)
   - Select persona → enter first rule in natural language → confirm parsed JSON preview → save.
2. **Daily Usage Interception**
   - Background service monitors target apps (Android UsageStats API).
   - On breach attempt → modal with AI prompt → user enters reason → AI verdict + coaching → user decision logged.
3. **Weekly Reflection**
   - Receive push + email → open digest screen highlighting stats, excuse trends, and next-step nudges.

## Experience & Brand Guardrails (agent inputs)
- **Voice & Tone (brand-guardian):** authoritative, concise, never shaming. Use short imperative sentences, no slang. Maintain consistent color pairing (deep navy primary, alert amber accent) and typographic hierarchy (H1 30px, body 16px) for gravitas.
- **UI framing (ui-designer):** mobile-first dark-on-light layout, high-contrast callouts for decisions, card stack for logs. Components reuse 4/8/16 spacing, include loading and error states, ready for React Native implementation.
- **Behavioral nudges (ux-researcher):** surface positive streaks, contextual reminders (“You promised to stay off short videos until after study block”). Limit cognitive load to <3 actions per screen.

## Data & Analytics Requirements
- Logging tables: `rules`, `interceptions`, `override_reasons`, `weekly_reports` in Supabase. All PII hashed; secrets in `.env.local` per config.
- Metrics to track: daily active rules, interception compliance rate, average excuse persuasiveness score, weekly streak retention.
- Privacy: store only necessary metadata; allow export & deletion.

## Non-Functional Requirements
- **Performance:** interception dialog latency ≤ 2s (LLM response). Pre-fetch persona prompt for top apps.
- **Availability:** core interception service ≥ 99% during user-defined focus windows.
- **Security & Privacy:** Supabase Row Level Security; JWT-based mobile auth; encrypt sensitive logs at rest; follow consent screen for data usage.
- **Accessibility:** WCAG AA equivalent (contrast ≥ 4.5:1, support screen readers, haptic feedback).
- **Scalability:** design prompt + rule evaluation to support 10k daily active users with minimal infra tweaks (use Supabase functions & serverless cron).

## Pilot Rollout Plan
1. Closed beta (30 users) → validate interception success and persona tone.
2. Iterate weekly on debate prompt and excuse taxonomy.
3. Public beta with subscription toggle (Stripe) once retention > 60% week-over-week.

## Research & Validation Backlog
- Guerrilla usability tests on interception flow (Day 3 / Day 6 cadence).
- Micro-survey on perceived fairness after overrides.
- Comparative analysis vs. Forest/Opal to refine differentiation messaging.

## “Runnable” Example Scenario
> **Context:** Student Li Wei tries to open TikTok during study block.

1. Rule stored: `{ "app_id": "com.zhiliaoapp.musically", "weekday": "Mon-Fri", "blocked_window": "21:00-23:00" }`
2. Attempt at 21:45 triggers interception modal.
3. User input: “I just need a 5-minute break.”
4. LLM prompt (严父 tone) evaluates history (2 prior breaks tonight) → responds: “休息不是刷短视频的理由。先完成今天的数学练习，再来讨论。”
5. System records verdict `deny`, user chooses `comply`. Streak +1 recorded for nightly discipline.

## Open Questions for User Review
- Should emergency overrides notify a trusted contact or stay private?
- Preferred cadence for weekly reports (push vs. email vs. in-app only)?
- Any regional compliance requirements (e.g., data residency in CN)?

---
**Next Step:** Await user approval on this PRD before moving to development guidelines (Phase 1).
