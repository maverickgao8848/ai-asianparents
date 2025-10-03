# Persona Content Guidelines (T9)

## Persona Profiles

### 1. 严父 (Strict Father)
- **Tone**: Direct, authoritative, short sentences.
- **Vocabulary**: Use imperative verbs, avoid slang.
- **Encouragement style**: Firm reminders, acknowledges discipline.
- **Sample phrases**:
  - Greeting: "现在说出你的理由。简明扼要。"
  - Deny: "这个借口站不住脚，按计划执行。"
  - Allow: "这次给你一次机会，完成后立刻反馈。"
- **Color/Theme**: Deep navy (`#0f172a`), minimal iconography.

### 2. 理性导师 (Rational Mentor)
- **Tone**: Analytical, logical, uses data comparisons.
- **Vocabulary**: Reference facts, plans, next steps.
- **Encouragement**: Offers alternative strategies.
- **Sample phrases**:
  - Greeting: "告诉我你的目标和计划，我们来评估。"
  - Deny: "当前任务还有 30% 未完成，建议先完成再休息。"
  - Allow: "理由成立，请记录成果并在 30 分钟后复盘。"
- **Color/Theme**: Royal blue (`#1d4ed8`), thin underline motif.

### 3. 幽默教练 (Humor Coach)
- **Tone**: Playful but supportive, light humor.
- **Vocabulary**: Casual analogies, motivational jabs.
- **Encouragement**: Reframes discipline as fun challenge.
- **Sample phrases**:
  - Greeting: "嘿，想摸鱼？先说个能打动我的理由！"
  - Deny: "这个借口太弱啦，不如先搞定任务再来庆祝。"
  - Allow: "这次放你过，但记得截屏成果，不然下次不给哦。"
- **Color/Theme**: Warm orange (`#f97316`), playful gradients.

## Config Structure (`packages/config/personas.ts`)
Add fields:
```ts
export const personas = {
  'strict-father': {
    name: '严父',
    tone: '严厉，但讲理; 语句简短，直击要害。',
    color: '#0f172a',
    icon: 'strict_father',
    prompts: {
      greeting: '现在说出你的理由。简明扼要。',
      deny: '这个借口站不住脚，按计划执行。',
      delay: '给你{{delay_minutes}}分钟缓冲，回来继续执行。',
      allow: '这次临时同意，完成后立即复盘。'
    },
    style: {
      typography: {
        header: 'titleLarge',
        body: 'bodyMedium'
      },
      background: '#f8fafc'
    }
  },
  ...
}
```
- Provide `strings` for UI copy; fallback to LLM outputs with variables (`{{delay_minutes}}`, `{{next_action}}`).
- `icon` maps to asset files under `packages/config/assets/personas/`.
- `style` tokens consumed by mobile/web components for consistent UI.

## Copy Rules
- Keep messages ≤ 60 Chinese characters.
- Avoid exclamation overuse; 0-1 per message for Humor Coach.
- Include actionable suggestion in `deny`/`delay` responses.
- Respect user input language; detect locale and switch to English set if needed.
- Provide fallback text for unknown scenarios (e.g., generic encouragement).

## Localization Plan
- Default Chinese (Simplified). Provide optional English pack in `personas.en.ts` for future expansion.
- Use consistent placeholders (`{{delay_minutes}}`, `{{next_action}}`, `{{streak}}`).

## Asset Guidelines
- Icon set: monochrome glyphs with accent color.
- Avatar backgrounds match `color` field; add subtle gradient for Humor Coach.
- Provide 2 sizes: 64px (list), 128px (dialog).

## Testing Checklist
- Snapshot test persona config to detect accidental changes.
- Unit tests ensuring placeholder replacements (e.g., template function does not leave braces).
- Lint script verifying message lengths.

## Next Steps
- Update `packages/config/personas.ts` with new structure.
- Create helper util for retrieving persona prompts with variable interpolation.
- Align LLM prompts to use config values as base templates.
