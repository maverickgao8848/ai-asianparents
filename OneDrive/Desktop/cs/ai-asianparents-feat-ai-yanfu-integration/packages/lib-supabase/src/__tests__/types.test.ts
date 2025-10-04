import {
  RuleConstraintsSchema,
  RuleExceptionInsertSchema,
  RuleInsertSchema,
  RULE_EXCEPTION_KINDS,
  RULE_STATUSES,
  WEEK_DAYS
} from '../types';

describe('rule schema definitions', () => {
  it('accepts a valid rule insert payload', () => {
    const sample = RuleInsertSchema.parse({
      user_id: '4c9e3f10-8360-4fa6-9f07-91a8d0a3c111',
      app_identifier: 'com.zhiliaoapp.musically',
      platform: 'android',
      limit_minutes: 30,
      constraints: {
        daily_quota_minutes: 20,
        time_windows: [
          { start: '21:00', end: '23:00' }
        ],
        cooldown_minutes: 15,
        allow_emergency_unlock: true,
        tags: ['study-break']
      },
      days_of_week: ['mon', 'tue']
    });

    expect(sample.status).toBe('active');
    expect(sample.reason_required).toBe(true);
  });

  it('guards constraint payload structure', () => {
    const constraints = RuleConstraintsSchema.safeParse({
      daily_quota_minutes: -10
    });

    expect(constraints.success).toBe(false);
  });

  it('validates rule exception payloads', () => {
    const exception = RuleExceptionInsertSchema.parse({
      rule_id: '8d8a161e-6aab-4911-8f6d-7c4b60b32456',
      kind: 'emergency',
      starts_at: '2024-02-19T12:00:00Z',
      ends_at: '2024-02-19T12:30:00Z',
      reason: '火警演练',
      metadata: { origin: 'user' }
    });

    expect(exception.kind).toBe('emergency');
  });

  it('exposes normalized enums without duplicates', () => {
    const uniqueDays = new Set(WEEK_DAYS);
    const uniqueStatuses = new Set(RULE_STATUSES);
    const uniqueKinds = new Set(RULE_EXCEPTION_KINDS);

    expect(uniqueDays.size).toBe(WEEK_DAYS.length);
    expect(uniqueStatuses.size).toBe(RULE_STATUSES.length);
    expect(uniqueKinds.size).toBe(RULE_EXCEPTION_KINDS.length);
  });
});
