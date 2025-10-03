# Testing Strategy (T12)

## Test Pyramid Overview
1. **Unit Tests**
   - Scope: UI components (React Native, Next.js), utility functions, Supabase Zod schemas.
   - Tools: Jest, React Testing Library, ts-jest, Deno tests for Edge Functions.
2. **Integration Tests**
   - Scope: Supabase Edge Functions with mock clients, API routes (Next.js), React Query hooks.
   - Tools: Jest + supertest (for API), Deno + Supabase local emulator (future).
3. **End-to-End Tests**
   - Scope: Mobile flows (rule creation → interception), Web admin dashboards.
   - Tools: Playwright (web), Detox/Expo EAS or Playwright for Expo web preview (later stage).

## Current Coverage
- `packages/lib-supabase`: schema validation (Jest).
- `packages/config`: persona prompts (Jest).
- `supabase/functions/parse-rule`: Deno tests for parsing heuristics.
- `apps/web-admin`: home page smoke test.
- Mobile tests temporarily skipped due to Jest environment issues (documented in `docs/notes/skip_mobile_tests.md`).

## Action Items
- [ ] Restore mobile Jest environment (transform config or Expo recommended setup).
  - Status: attempted using `jest-expo/universal` with custom module mocks; still blocked by Expo Winter ESM modules. Track follow-up to align with Expo 50 Jest guidance or adopt Expo-provided test runner.
- [ ] Add integration tests for new Edge Functions (`parse-rule`, upcoming `intercept-session`, `generate-weekly-report`).
- [ ] Introduce Playwright suite for key flows once UI screens exist.
- [ ] Create contract tests for Supabase RPC/SQL queries using local emulator.
- [ ] Configure coverage thresholds and report to CI.

## Scripts & Commands
- `pnpm test` – runs all package tests (mobile currently prints `[skip]`).
- `./deno test ...` – Edge Function-specific tests (installed locally under `.local/deno`).
- Add new script targets:
  - `pnpm --filter apps/mobile test:watch` once Jest restored.
  - `pnpm e2e` for Playwright (future).

## CI Integration (GitHub Actions)
1. **Lint & Typecheck** (already configured) – run before tests.
2. **Unit Tests** – `pnpm test` (fail if any subproject fails).
3. **Deno Tests** – add step `./deno test ...` (or wrap in npm script).
4. **Coverage Upload** – use `jest --coverage` and merge reports (store artifact).
5. **E2E (future)** – triggered on release branches or nightly to keep pipeline fast.

## Quality Gates
- All PRs must include or update tests relevant to changed logic.
- For new Edge Functions/UI flows, require both unit and integration test evidence.
- Document manual QA checklist (later) for beta milestones.

## Tooling Enhancements
- Consider `msw` for HTTP mocking in integration tests.
- Use `@testing-library/react-native` with `expo-router/testing-library` once available.
- Adopt `supabase-js` typed client with `@supabase/postgrest-js` for contract tests.

## Reporting
- Maintain `docs/testing_strategy.md` (this file) updated per milestone.
- Add badge to README once coverage reporting set up.
