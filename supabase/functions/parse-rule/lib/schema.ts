import { z } from 'zod';

export const RequestSchema = z.object({
  text: z.string().trim().min(1).max(500),
  timezone: z.string().optional().default('Asia/Shanghai'),
  locale: z.string().optional().default('zh-CN'),
  history: z
    .array(
      z.object({
        app_identifier: z.string(),
        limit_minutes: z.number().int().positive().optional(),
        status: z.string().optional()
      })
    )
    .optional()
    .default([])
});

export type ParseRuleRequest = z.infer<typeof RequestSchema>;

export const RuleDraftSchema = z.object({
  app_identifier: z.string().nullable(),
  app_display_name: z.string().optional(),
  platform: z.enum(['android', 'ios', 'web', 'other']).default('android'),
  limit_minutes: z.number().int().positive().optional(),
  days_of_week: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  constraints: z
    .object({
      time_windows: z
        .array(
          z.object({
            start: z.string(),
            end: z.string()
          })
        )
        .optional(),
      daily_quota_minutes: z.number().int().positive().optional(),
      cooldown_minutes: z.number().int().nonnegative().optional(),
      notes: z.string().optional(),
      allow_emergency_unlock: z.boolean().optional()
    })
    .default({})
});

export type RuleDraft = z.infer<typeof RuleDraftSchema>;

export const ResponseSchema = z.object({
  ruleDraft: RuleDraftSchema.nullable(),
  warnings: z.array(z.string()),
  errors: z.array(z.string())
});

export type ParseRuleResponse = z.infer<typeof ResponseSchema>;
