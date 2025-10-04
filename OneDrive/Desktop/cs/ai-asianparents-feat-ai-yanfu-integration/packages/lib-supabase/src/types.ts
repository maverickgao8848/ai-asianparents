import { z } from 'zod';

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const RULE_STATUSES = ['active', 'snoozed', 'archived'] as const;
export type RuleStatus = (typeof RULE_STATUSES)[number];

export const RULE_EXCEPTION_KINDS = [
  'temporary_allow',
  'emergency',
  'scheduled_break'
] as const;
export type RuleExceptionKind = (typeof RULE_EXCEPTION_KINDS)[number];

export const RuleConstraintsSchema = z.object({
  daily_quota_minutes: z.number().int().positive().optional(),
  time_windows: z
    .array(
      z.object({
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/)
      })
    )
    .optional(),
  cooldown_minutes: z.number().int().nonnegative().optional(),
  allow_emergency_unlock: z.boolean().optional(),
  notes: z.string().max(280).optional(),
  tags: z.array(z.string().min(1)).optional()
});

export const RuleInsertSchema = z.object({
  user_id: z.string().uuid(),
  app_identifier: z.string().min(1),
  app_display_name: z.string().min(1).optional(),
  platform: z.enum(['android', 'ios', 'web', 'other']).optional(),
  limit_minutes: z.number().int().positive().optional(),
  constraints: RuleConstraintsSchema.default({}),
  days_of_week: z.array(z.enum(WEEK_DAYS)).default(WEEK_DAYS.slice() as WeekDay[]),
  status: z.enum(RULE_STATUSES).default('active'),
  persona_key: z.string().min(1).default('strict-father'),
  reason_required: z.boolean().default(true)
});

export type RuleInsert = z.infer<typeof RuleInsertSchema>;
export type RuleConstraints = z.infer<typeof RuleConstraintsSchema>;

export const RuleExceptionInsertSchema = z.object({
  rule_id: z.string().uuid(),
  kind: z.enum(RULE_EXCEPTION_KINDS),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
  reason: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).default({})
});

export type RuleExceptionInsert = z.infer<typeof RuleExceptionInsertSchema>;
