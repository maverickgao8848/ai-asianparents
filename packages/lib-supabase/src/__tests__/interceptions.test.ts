import {
  AiVerdictEnum,
  InterceptionEntryInsertSchema,
  InterceptionInsertSchema,
  InterceptionTriggerEnum,
  ReasonCategoryEnum,
  UserDecisionEnum
} from '../interceptions';

describe('interception schemas', () => {
  it('validates interception insert payload', () => {
    const payload = InterceptionInsertSchema.parse({
      user_id: 'd1a9a67f-5c6d-4b9d-9f25-7f3ec36b1a0f',
      rule_id: 'fbcd5d8e-3e9a-40a5-8ec1-a0b63b6bcf20',
      persona_key: 'strict-father',
      trigger: 'quota_exceeded',
      streak: 4,
      override_count_today: 1
    });

    expect(payload.appeal_used).toBe(false);
    expect(payload.emergency_flag).toBe(false);
  });

  it('rejects invalid confidence', () => {
    const result = InterceptionEntryInsertSchema.safeParse({
      interception_id: 'fbcd5d8e-3e9a-40a5-8ec1-a0b63b6bcf20',
      turn: 1,
      ai_confidence: 2
    });

    expect(result.success).toBe(false);
  });

  it('allows optional fields when provided', () => {
    const entry = InterceptionEntryInsertSchema.parse({
      interception_id: 'fbcd5d8e-3e9a-40a5-8ec1-a0b63b6bcf20',
      turn: 2,
      user_reason: '今晚有紧急会议',
      reason_category: 'work',
      ai_verdict: 'delay',
      ai_confidence: 0.78,
      persona_response: '会议结束后立刻回来汇报。',
      user_decision: 'comply'
    });

    expect(entry.user_decision).toBe('comply');
  });

  it('exports enum values for downstream use', () => {
    expect(InterceptionTriggerEnum.options).toContain('blocked_window');
    expect(AiVerdictEnum.options).toContain('deny');
    expect(UserDecisionEnum.options).toContain('emergency');
    expect(ReasonCategoryEnum.options).toContain('mental_break');
  });
});
