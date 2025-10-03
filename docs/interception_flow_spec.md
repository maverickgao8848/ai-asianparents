# Interception Dialog Spec (T3)

## Goals
- Enforce a decision gate before rule overrides.
- Reflect persona tone while maintaining consistency.
- Capture structured data (reason, verdict, user choice) to feed analytics and reports.

## Trigger Context
- Fired by Android UsageStats watcher when user opens monitored app outside allowance or exceeding quota.
- Request payload to backend (Edge Function `intercept-session`) includes:
  ```json
  {
    "user_id": "uuid",
    "rule_id": "uuid",
    "app_identifier": "string",
    "app_display_name": "string",
    "trigger": "quota_exceeded | blocked_window | cooldown_active",
    "timestamp": "ISO8601",
    "persona_key": "strict-father | rational-mentor | humor-coach",
    "streak": 3,
    "override_count_today": 1
  }
  ```

## Conversation State Machine
```
[Start]
  → Fetch context (rule + recent logs)
  → Persona Greeting / Challenge (S1)
  → Await user reason input (S2)
  → Evaluate reason vs rule (LLM + heuristics) (S3)
    ↳ Verdict: Deny | Delay | Allow
  → Compose response + recommended action (S4)
  → User choice (Comply | Override | Emergency) (S5)
  → Log outcome + close (S6)
```
- Allow one "appeal" if user disputes verdict; cap to 2 turns to avoid fatigue.
- Emergency branch bypasses debate but records reason.

## Data Captured Per Turn
| Field | Description |
|-------|-------------|
| `reason_text` | Raw user input. |
| `reason_category` | Classified (work, study, mental_break, emergency, other). |
| `ai_verdict` | `deny` | `allow` | `delay`. |
| `confidence` | 0-1, from LLM logit or heuristic scoring. |
| `persona_response` | Final message delivered to user. |
| `user_decision` | `comply` | `override` | `emergency`. |
| `appeal_used` | boolean. |

## Persona Prompt Templates
Shared system preamble:
```
You are {{persona_name}}, a strict but fair digital guardian. Always stay concise (≤60 Chinese characters per message). You must evaluate whether the user's reason justifies breaking the rule:
Rule summary: {{rule_summary}}
Trigger: {{trigger}}
Streak: {{streak}}
History today: {{override_count_today}} overrides
```

### 严父 (strict-father)
- Tone: authoritative, direct, no emojis.
- Template:
  - **Initial challenge:**
    ```
    Before user speaks:
    "现在想打开{{app_display_name}}的理由是什么？保持诚实。"
    ```
  - **Evaluation response:**
    ```
    if verdict == deny:
      "这个理由站不住脚。先完成{{next_action}}，再谈放松。"
    if verdict == delay:
      "给你{{delay_minutes}}分钟缓冲，回来后我要看到执行结果。"
    if verdict == allow:
      "这次暂时同意，但记得记录结果。下次别再找借口。"
    ```

### 理性导师 (rational-mentor)
- Tone: analytical, offers alternatives.
  ```
  Challenge: "请告诉我你此刻的计划，我们一起评估是否合理。"
  Deny: "根据规则，你还有{{remaining_minutes}}分钟任务未完成。建议先完成{{next_action}}。"
  Delay: "我建议设置{{delay_minutes}}分钟计时，之后回来复盘。"
  Allow: "理由成立。我会记录这次例外，请在事后写下成果。"
  ```

### 幽默教练 (humor-coach)
- Tone: light, encouraging, still firm.
  ```
  Challenge: "嘿，想摸鱼？先说个能打动我的理由吧！"
  Deny: "这个借口太弱啦。不如先{{next_action}}，待会儿再刷，保证更香。"
  Delay: "OK，设个{{delay_minutes}}分钟的小休息，闹钟一响马上回来。"
  Allow: "这次给你放行，但我要一张成绩截图，别忘了哦！"
  ```

## LLM Decision Logic
- Inputs: rule constraints, user reason, streak, recent overrides.
- Multi-step reasoning template ensures verdict justifications are logged.
- Post-processing heuristics:
  - If `override_count_today >= 3` ⇒ downgrade allow to delay/deny unless emergency keyword present.
  - If reason contains urgent keywords ("火警", "医院", "emergency") ⇒ set verdict allow + emergency flag.

## UI Flow Notes (for T4 handoff)
1. Modal slide-up with persona avatar + countdown overlay (20s auto-dismiss to comply).
2. Textarea for user reason (min 10 chars to reduce spam).
3. Buttons: `遵守规则` (Comply), `仍要解锁` (Override), `紧急情况` (Emergency).
4. Display AI verdict in colored badge: deny=red, delay=amber, allow=green.
5. If delay verdict, offer `接受延迟` button that sets timer + logs compliance.

## Analytics & Telemetry
- Log event `interception.dialog_completed` with fields from table above.
- Track appeal usage, response latency, persona efficiency (compliance rate).
- Trigger weekly summary insight: "本周最常出现的借口类型" based on `reason_category`.

## Testing Recommendations
- Mock conversation unit tests for each persona ensuring prompt tokens fit within 1k tokens.
- Snapshot prompts to detect unintended changes.
- Scenario tests: repeated override attempts, emergency keywords, bilingual input.

## Dependencies
- Relies on `packages/config/personas.ts` for display assets.
- Shares classification utilities with rule parser (tags mapping).

## Next Steps
- Implement `intercept-session` Edge Function orchestrating LLM call + verdict logic.
- Coordinate with mobile UI (T4) to reflect verdict states and actions.
