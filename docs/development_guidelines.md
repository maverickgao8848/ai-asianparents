# AI 严父 – Development Guidelines

## Guiding Principles
- Ship MVP iterations quickly; defer non-essential polish until behavior data validates demand.
- Prefer managed services (Supabase, Stripe, Vercel, Expo) over self-hosted stacks.
- Keep modules small, typed (TypeScript), and easy to swap; no premature abstraction.
- Centralize secrets in `.env.local` (never hard-code keys).

## Code Style
- **Language & Tooling:** TypeScript everywhere (React Native, Next.js admin, Supabase Edge Functions). Enforce `eslint-config-universe` (Expo) plus project rules, and Prettier via pre-commit.
- **Formatting:** 2-space indent, single quotes, semicolons off, trailing commas when valid.
- **React conventions:**
  - Functional components + hooks; avoid class components.
  - Declare props/response shapes with interfaces.
  - Use `React.FC` only for components needing `children`; otherwise explicit props typing.
- **State management:** Start with React context + hooks; escalate to Zustand only if shared state becomes complex.
- **Error handling:** Wrap async calls with `try/catch`; surface user-friendly errors tied to persona tone.

## Naming Conventions
- **Files & folders:** kebab-case for directories (`session-logs`), PascalCase for component files (`SessionLogCard.tsx`), camelCase for utilities (`formatReason.ts`).
- **Variables/functions:** camelCase (`handleOverride`); booleans prefixed with `is/has/should`.
- **React components:** PascalCase (`StrictFatherDialog`).
- **Supabase tables:** snake_case (`override_reasons`), with plural nouns (`interceptions`).
- **Edge functions:** prefix with action + domain (`process-weekly-report`).
- **Environment vars:** uppercase with service prefix (`SUPABASE_URL`, `OPENAI_API_KEY`).

## File & Folder Structure (monorepo via Turbo/PNPM)
```
/
  apps/
    mobile/           # Expo React Native client (MVP focus)
    web-admin/        # Next.js dashboard + landing (deployed to Vercel)
  packages/
    ui/               # Shared UI components (React Native + web via React Native Web)
    lib-supabase/     # Typed Supabase client + RPC wrappers
    config/           # ESLint, Prettier, tsconfig base, brand tokens
  supabase/
    functions/        # Edge functions (rule parsing, report generation)
    migrations/       # SQL migrations managed via Supabase CLI
  .github/workflows/  # CI: lint, test, build
```
- Add new directories only when two+ modules share logic.
- Keep persona tone strings in `packages/config/personas.ts` for reuse.

## API Design Rules
- RESTful endpoints exposed via Supabase Edge Functions under `/v1/*`.
- Nouns plural (`/v1/interceptions`), actions via HTTP verbs (`POST` to log, `GET` for reports).
- Include `version` header & embed `request_id` in responses for tracing.
- Standard response envelope:
```json
{
  "data": {...},
  "error": null,
  "meta": { "request_id": "uuid", "elapsed_ms": 120 }
}
```
- Return 422 for validation issues; 401 for auth failures; 429 when exceeding override quota.

## Testing Strategy
- **Unit:** Jest + React Testing Library (`apps/mobile`, `apps/web-admin`).
- **Integration:** Supabase Edge Functions tested with Jest + `@supabase/supabase-js` mocks.
- **E2E:** Playwright flows (rule creation → interception → weekly report).
- Each merged PR must include/update at least one automated test covering the change.

## Accessibility & UX Guardrails
- Maintain WCAG AA contrast; dark text on light backgrounds per brand guardian guidance.
- Provide haptic + voiceover labels for key actions (`AccessibilityInfo.announceForAccessibility`).
- Limit interruption dialogs to three concise messages; always include “紧急情况” option.
- Surface positive reinforcement (streak counts) per UX researcher instructions.

## Deployment & DevOps
- Mobile: Expo Application Services (EAS) for builds; nightly preview via Expo Update.
- Web: Deploy `apps/web-admin` to Vercel; branch previews auto-enabled.
- Edge Functions: deploy through Supabase CLI with staged environments (`dev`, `staging`, `prod`).
- CI (GitHub Actions):
  1. Install dependencies (`pnpm install`).
  2. Lint + typecheck.
  3. Run unit tests; cache coverage artifacts.
  4. Build mobile + web (smoke build).

## Runnable Example
Type-safe interception logger invoked from the mobile app:

```ts
// apps/mobile/src/services/logInterception.ts
import { supabase } from '@lib-supabase/client';

export async function logInterception(params: {
  ruleId: string;
  verdict: 'allow' | 'deny' | 'delay';
  userDecision: 'comply' | 'override' | 'emergency';
  reason: string;
}) {
  const { error } = await supabase.from('interceptions').insert({
    rule_id: params.ruleId,
    verdict: params.verdict,
    user_decision: params.userDecision,
    reason_text: params.reason,
  });

  if (error) {
    throw new Error(`Failed to log interception: ${error.message}`);
  }
}
```
- **Run:** `pnpm --filter apps/mobile test logInterception` (Jest).
- **Why it matters:** demonstrates shared Supabase client usage, typed params, and consistent error messaging.

## Documentation Workflow
- Update `docs/` on every milestone (PRD, guidelines, tech stack, tasks).
- Prefer markdown with locale-friendly headings (Chinese or English acceptable) but keep ASCII characters.

## Collaboration Checklist
- Open GitHub issue per task; link Supabase schema changes.
- Request review from `code-reviewer` agent before merging complex flows.
- Record weekly learnings in `docs/notes/week-XX.md` (short bullet list).
