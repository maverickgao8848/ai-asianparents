# Rule Parsing Edge Function Spec (T2)

## Objective
Convert user-entered natural language into structured rule objects compatible with the `rules` and `rule_exceptions` schema. The function must be deterministic, guard against hallucinations, and provide actionable validation feedback so users can confirm rules before saving.

## Overview
- **Execution**: Supabase Edge Function (`supabase/functions/parse-rule/index.ts`).
- **Invocation**: Mobile app sends `{ text: string, locale?: string, timezone?: string }` plus optional context (existing rules, persona).
- **Outputs**: JSON payload containing `ruleDraft` + `warnings` + `errors`. When parsing fails, return empty `ruleDraft` and populated `errors` array.
- **LLM Stack**: Primary model `gpt-4o-mini` via OpenAI, fallback `claude-3-haiku` (Anthropic). All calls go through shared `ai-debate` service for logging and cost tracking as required by guidelines.

## Input Contract
```json
{
  "text": "Weekdays 9-18 TikTok <= 20 minutes",
  "timezone": "Asia/Shanghai",
  "locale": "en-US",
  "history": [
    {
      "app_identifier": "com.zhiliaoapp.musically",
      "limit_minutes": 20,
      "status": "active"
    }
  ]
}
```

### Field Notes
- `text`: required; trimmed; reject if length > 500 characters.
- `timezone`: optional IANA string; default `Asia/Shanghai` (aligns `.env` default).
- `locale`: used for prompt localization; default `zh-CN`.
- `history`: used to reduce duplicates; limited to last 10 entries.

## Output Contract
```json
{
  "ruleDraft": {
    "app_identifier": "com.zhiliaoapp.musically",
    "app_display_name": "TikTok",
    "platform": "android",
    "limit_minutes": 20,
    "days_of_week": ["mon", "tue", "wed", "thu", "fri"],
    "constraints": {
      "time_windows": [
        { "start": "09:00", "end": "18:00" }
      ],
      "notes": "Weekday focus window"
    }
  },
  "warnings": ["Existing rule found; will overwrite if confirmed."],
  "errors": []
}
```

## Processing Pipeline
1. **Input sanitation**
   - Strip HTML, normalize whitespace, truncate >500 chars.
   - Validate timezone via `Intl.supportedValuesOf('timeZone')` fallback list.
2. **LLM parsing**
   - Compose prompt using system template (严父 tone: brief, direct) + user text + JSON schema definition.
   - Use `response_format` / function call style to enforce JSON.
   - Set `temperature=0.1` for determinism.
3. **Post-processing**
   - Schema validation via Zod (`RuleInsertSchema`, `RuleConstraintsSchema`).
   - Normalize times to `HH:mm`, convert durations to minutes, map days from natural language to `week_day` enum.
   - De-duplicate constraints and inject defaults (status `active`, persona `strict-father`).
4. **Diff against history**
   - Compare key fields (app + window) to flag duplicates.
5. **Response assembly**
   - Return structured output with warnings/errors arrays. No throws; always HTTP 200.

## Prompt Template (excerpt)
```
System:
  你是一名严谨的规则解析助手，需要把用户的自然语言转成符合如下JSON Schema的对象。不要解释，不要添加主观猜测。

User:
  用户输入: "{{text}}"
  时区: {{timezone}}
  输出格式:
  {
    "app_identifier": "string",
    "app_display_name": "string",
    "platform": "android|ios|web|other",
    "limit_minutes": number,
    "days_of_week": ["mon"...],
    "constraints": {
       "time_windows": [{"start": "HH:mm", "end": "HH:mm"}],
       "daily_quota_minutes": number,
       "cooldown_minutes": number,
       "notes": string
    }
  }
```
- Include mini knowledge base of popular Chinese/Global apps → bundle ids.
- Add guard clause: if app unknown, set display name but leave `app_identifier` null + add warning.

## Validation & Error Handling
- **Hard errors** (populates `errors`):
  - Missing app target.
  - No duration or window specified.
  - Unsupported date/time expressions.
- **Warnings**: ambiguous locale terms (“weekend”, “节假日”), duplicate with history, limit > 480 minutes.
- Map natural language to enumerations using regex + dictionary (`weekday`, `weekend`, “工作日”, “周末”).

## Testing Strategy
- Unit tests (Edge Function):
  - Mock LLM response with fixtures (no live calls) ensuring deterministic parsing.
  - Cover scenarios: weekday limit, nightly ban, weekend only, unknown app, commands in Chinese.
- Contract tests:
  - Validate output against `RuleInsertSchema` & `RuleConstraintsSchema`.
  - Ensure warnings/errors lists behave as expected.
- Integration (future):
  - E2E test hitting staging function with canned prompt (behind feature flag) to monitor drift.

## Implementation Checklist
- [ ] Scaffold Edge Function under `supabase/functions/parse-rule`.
- [ ] Implement LLM client wrapper (reuse `@ai-yanfu/lib-supabase` config if possible or new `packages/lib-ai`).
- [ ] Add Zod-based validation + mapping utilities.
- [ ] Write Jest tests with mocked LLM.
- [ ] Update mobile app to call function before saving rule.

## Observability
- Log parse attempts with `request_id`, model, latency.
- Emit metrics: success rate, warnings per request, error reason distribution.
- Store anonymized samples (<=100 chars) in Supabase `rule_parse_audit` for prompt tuning (respect privacy).

## Risks & Mitigations
- **Model hallucination** → low temperature, explicit JSON schema, validate fields.
- **Latency spikes** → implement timeout (3s) and quick fallback to rule templates.
- **App dictionary drift** → maintain JSON map in config package; update via weekly batch.

## Next Steps
- Proceed to Edge Function implementation (T2 development work).
- Coordinate with mobile team to surface warnings before confirmation.
