# Reason Classification Plan (T6)

## Objective
Provide consistent tagging for interception reasons, supporting analytics (top excuses, weekly summaries) and adaptive prompts. Aim for low-latency classification that can run on-device or in Edge Function fallback if LLM unavailable.

## Taxonomy (aligned with DB enum)
1. `work` – 工作、会议、客户沟通等
2. `study` – 学习、考试、作业相关
3. `health` – 身体/心理健康、运动、休息调整
4. `mental_break` – 纯放松、娱乐、无特定目的的休息
5. `social` – 朋友、家人、社交媒体沟通
6. `emergency` – 紧急情况、突发事件、危机
7. `other` – 以上都不匹配或用户明确拒绝说明

## Classification Strategy
- **Primary:** rule-based keyword matcher using locale-specific dictionaries + regex (fast, deterministic).
- **Secondary:** LLM fallback (same models as rule parser) when rule-based returns `other` or low confidence; caches results for repeated phrases.
- **Confidence scoring:**
  - Rule-based matches assign confidence 0.9 when high-priority keyword found, 0.6 for generic match.
  - LLM response includes rationale; convert to confidence (allow/deny mapping) and threshold (>0.7 accepted).

### Keyword Dictionary (excerpt)
```ts
const keywordMap = {
  work: ['加班', '会议', '客户', '汇报', 'deadline', 'email'],
  study: ['考试', '复习', '作业', '上课', 'lecture', '学习'],
  health: ['健身', '锻炼', '医生', '休息', '睡觉', '疲劳', 'meditation'],
  mental_break: ['放松', '娱乐', '刷会儿', '看视频', '游戏一下'],
  social: ['朋友', '家人', '聊天', '群聊', '约会', 'message'],
  emergency: ['火警', '急事', '紧急', '医院', '急救', 'emergency']
};
```
- Support multi-locale by loading additional dictionaries (English, simplified Chinese; extendable via JSON config).

## Implementation Outline
- Add utility in `packages/lib-supabase` or new `packages/lib-classifier` with function:
  ```ts
  classifyReason(reason: string, locale?: string): {
    category: ReasonCategory;
    confidence: number;
    matchedKeywords: string[];
    needs_llm: boolean;
  }
  ```
- If `needs_llm` true, Edge Function `classify-reason` uses deterministic LLM prompt to finalize category.
- Persist final category in `interception_entries.reason_category` and optionally update `override_reasons` dictionary when new phrases emerge.

## LLM Prompt (fallback)
```
System: 你是分类助手，把用户给出的理由归类到以下标签之一：work, study, health, mental_break, social, emergency, other。
Rules: 只输出JSON {"category": "value", "confidence": number, "keywords": [..] }。
User reason: "{{reason_text}}"。
```
- Force temperature 0.
- Validate JSON with Zod before accepting.
- Reject if confidence <0.6 (fallback to `other`).

## Testing Plan
- Unit tests for keyword classifier (Chinese + English cases, case-insensitivity, punctuation stripping).
- Snapshot tests for fallback prompt template.
- Mocked LLM tests verifying JSON structure.
- Data quality checks: run classifier on sample dataset weekly, manual review top N phrases per category.

## Monitoring
- Track classification distribution per week; alert if `other` exceeds 20%.
- Log fallback rate; aim <10% once dictionary matures.
- Provide admin tooling to add new keywords (future backlog).

## Next Steps
- Implement classifier utility + tests.
- Integrate with interception logging pipeline (Edge Function).
- Update weekly report generator to surface top `reason_category` with confidence weighting.
