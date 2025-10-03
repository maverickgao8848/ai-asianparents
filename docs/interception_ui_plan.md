# Interception UI Integration Plan (T4)

## Overview
- Target platform: Expo React Native (Android-first).
- Entry point: background watcher detects rule break → navigate to `InterceptDialogScreen` (modal stack via `expo-router`).
- UX anchors: fast load (<300ms), persona styling, minimal input friction, haptic feedback.

## Screen Architecture
```
app/
  (modals)/
    intercept.tsx      # modal route

src/
  screens/
    InterceptDialogScreen.tsx
  components/
    PersonaHeader.tsx
    ReasonInput.tsx
    VerdictCard.tsx
    ActionBar.tsx
    EmergencySheet.tsx
  hooks/
    useInterceptionSession.ts
    useCountdownTimer.ts
```
- `InterceptDialogScreen`
  - Composes header, body (reason input + AI response), action bar.
  - Receives params `{sessionId, ruleId}`.
  - Connects to React Query for fetching session context + posting responses.
- `PersonaHeader`
  - Displays avatar color from `@config/personas` and streak info.
- `ReasonInput`
  - TextArea with character counter & auto-focus.
- `VerdictCard`
  - Shows AI verdict badge + copy (three states: pending, result, delay countdown).
- `ActionBar`
  - Buttons for comply/override/emergency with loading states and haptic feedback.
- `EmergencySheet`
  - Bottom sheet allowing typed reason, optional contact note.

## State Management
- **React Query** (`@tanstack/react-query` already installed) for mutations:
  - `useInterceptionSession(sessionId)` – GET session context (rule, persona, streak, history).
  - `useSubmitReason()` – POST reason → receives `ai_verdict`, `persona_response`, `delay_minutes`.
  - `useLogDecision()` – POST final user decision.
- Local component state:
  - `reasonText`, `appealAttempted`, `delayCountdown`.
  - `isEmergencySheetOpen`, `isSubmitting` flags.
- Global context (new `InterceptionProvider`?): keep minimal; rely on navigating away once resolved.

## Data Flow
1. Screen mounts → Query session context (suspense fallback skeleton header + shimmer input).
2. User submits reason → call `/intercept-session/reason` Edge Function.
3. Response updates `VerdictCard` and shows persona message.
4. Action buttons enabled depending on verdict (allow/delay/deny).
5. On decision, call `/intercept-session/decision` logging outcome; navigate to confirmation toast + dismiss modal.
6. If emergency chosen → open sheet, require reason text, flag `emergency=true` in API call.

## UI States & Edge Cases
- **Loading**: skeleton header, disabled input with placeholder "严父正在准备…".
- **LLM pending**: show spinner inside `VerdictCard`, disable action buttons except cancel.
- **Timeout/Error**: fallback message "服务器忙，请保持专注" with retry button; log telemetry.
- **Appeal**: allow once—`useSubmitReason` called again with `appeal=true`; disable input after second response.
- **Delay**: display countdown timer; auto-close once timer hits zero (reopen if user returns early).
- **Accessibility**: VoiceOver labels for verdict, focus ring on input; high-contrast colors from design tokens.

## Styling Tokens
- Use shared persona colors from `@config/personas`.
- Typography: `titleLarge` (24/32), `bodyMedium` (16/24), `labelBold` (14/20).
- Buttons: base component with states (default/pressed/disabled) using `Pressable` wrappers.
- Provide dark mode variant (invert background, keep persona accent).

## Integration with Native Modules
- Trigger haptics (`expo-haptics`) on verdict and button press.
- Use `expo-keep-awake` to prevent screen dim while dialog active.
- Optional: `expo-av` for persona voice prompt (backlog).

## Testing Plan
- Component tests with `@testing-library/react-native` (ReasonInput, ActionBar behavior).
- Hook tests for `useCountdownTimer` ensuring accurate tick.
- E2E scenario (later) with Detox/Expo or Playwright for automated override flow.
- Mocks for network calls using MSW or custom `fetch` stub.

## TODO Checklist
- [ ] Create modal route + navigation guard.
- [ ] Implement React Query hooks with Supabase Edge calls.
- [ ] Build core components with Persona styling.
- [ ] Wire emergency sheet and countdown logic.
- [ ] Add unit tests + snapshot coverage.
- [ ] Connect analytics events (`interception.dialog_*`).

## Dependencies / Follow-ups
- Requires `intercept-session` Edge Function (upcoming T3/T4 dev).
- Rule logs DB needs columns for `appeal_used`, `confidence` (align with schema when implemented).
- Mobile tests currently skipped; ensure coverage once Jest environment fixed (see `docs/notes/skip_mobile_tests.md`).
