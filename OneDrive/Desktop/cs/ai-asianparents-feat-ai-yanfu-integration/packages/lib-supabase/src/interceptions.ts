import { z } from 'zod';

export const InterceptionTriggerEnum = z.enum([
  'quota_exceeded',
  'blocked_window',
  'cooldown_active'
]);

export const AiVerdictEnum = z.enum(['deny', 'delay', 'allow']);
export const UserDecisionEnum = z.enum(['comply', 'override', 'emergency']);
export const ReasonCategoryEnum = z.enum([
  'work',
  'study',
  'health',
  'mental_break',
  'social',
  'emergency',
  'other'
]);

export const InterceptionInsertSchema = z.object({
  user_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  persona_key: z.string().min(1),
  trigger: InterceptionTriggerEnum,
  streak: z.number().int().nonnegative().default(0),
  override_count_today: z.number().int().nonnegative().default(0),
  final_ai_verdict: AiVerdictEnum.optional(),
  final_decision: UserDecisionEnum.optional(),
  final_reason_category: ReasonCategoryEnum.optional(),
  appeal_used: z.boolean().default(false),
  emergency_flag: z.boolean().default(false)
});

export const InterceptionEntryInsertSchema = z.object({
  interception_id: z.string().uuid(),
  turn: z.number().int().positive(),
  user_reason: z.string().min(1).max(500).optional(),
  reason_category: ReasonCategoryEnum.optional(),
  ai_verdict: AiVerdictEnum.optional(),
  ai_confidence: z
    .number()
    .refine((val) => val >= 0 && val <= 1, {
      message: 'Confidence must be between 0 and 1'
    })
    .optional(),
  persona_response: z.string().min(1).max(500).optional(),
  user_decision: UserDecisionEnum.optional()
});

export type InterceptionInsert = z.infer<typeof InterceptionInsertSchema>;
export type InterceptionEntryInsert = z.infer<typeof InterceptionEntryInsertSchema>;
export type ReasonCategory = z.infer<typeof ReasonCategoryEnum>;
