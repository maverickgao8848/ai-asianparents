# AI 严父 – Tech Stack

| Layer | Tool / Service | Rationale |
|-------|----------------|-----------|
| Mobile App | React Native (Expo) + TypeScript | Fast cross-platform delivery, aligns with MVP and reuse of web-brand components. |
| Web Admin & Marketing | Next.js 14 (App Router) | Matches config preference, deploys to Vercel with SSR + static marketing pages. |
| Backend-as-a-Service | Supabase (Postgres, Auth, Storage, Edge Functions) | Managed auth+DB, realtime capabilities, easy policy enforcement, minimizes custom backend work. |
| AI Orchestration | OpenAI GPT-4o (debate persona) + Anthropic Claude fallback | High-quality natural language reasoning for “严父” debates while keeping API surface simple. |
| Rule Parsing Service | Supabase Edge Function (Node 18 runtime) | Converts natural language input to JSON rules close to data layer with minimal latency. |
| Payments | Stripe Billing | Supports subscription tiers (free vs premium) with managed invoicing and webhooks. |
| Notifications | Expo Push + Resend transactional email | Unified push for mobile, reliable weekly digest emails. |
| Analytics | Supabase row-level events + PostHog cloud | Tracks interceptions, streaks, and funnel metrics without custom pipelines. |
| Testing | Jest, React Testing Library, Playwright | Satisfies config requirement for automated coverage across unit, integration, E2E. |
| DevOps | GitHub Actions CI, Vercel deploys, Expo EAS, Supabase CLI | Automated lint/test/build plus one-click deploy to managed platforms. |
| Monitoring | Sentry (mobile + web), Vercel analytics | Captures runtime errors and performance trends with low setup overhead. |

## Integration Notes
- Use `supabase-js` client from shared `packages/lib-supabase`; initialize with env vars from `.env.local`.
- Stripe webhooks handled by Next.js route (`/api/stripe/webhook`) protected with secret signature.
- Weekly report generation runs via Supabase scheduled Edge Function, writes summaries to `weekly_reports` table and queues Expo push via Resend API.
- All AI calls flow through a single `ai-debate` Edge Function to centralize prompt templates and auditing.
- Secrets managed through `.env.local` (dev) and platform secret managers (Vercel/Expo/Supabase). No secrets committed.

## Deployment Targets
- **Mobile:** Expo EAS → internal testers (Android beta track first).
- **Web:** Vercel production + preview deployments.
- **Edge Functions:** Supabase staging → promoted to production after automated smoke tests.

## Tooling Dependencies
- Package manager: `pnpm` with workspace support.
- Formatter: Prettier via `pnpm format`.
- Lint: ESLint + TypeScript `pnpm lint`.
- Testing scripts: `pnpm test`, `pnpm test:e2e` (Playwright, runs on CI nightly).

Keep the stack lightweight; swap services only when usage scales past managed plan limits.
