import { z } from 'zod';

export const WeeklyReportPayloadSchema = z.object({
  apps: z
    .array(
      z.object({
        app_identifier: z.string(),
        total_minutes: z.number().int().nonnegative(),
        overrides: z.number().int().nonnegative().optional()
      })
    )
    .default([]),
  interceptions: z
    .object({
      attempts: z.number().int().nonnegative(),
      compliance_rate: z.number().min(0).max(1)
    })
    .optional(),
  top_reasons: z
    .array(
      z.object({
        category: z.string(),
        count: z.number().int().nonnegative(),
        sample: z.string().optional()
      })
    )
    .default([]),
  streak: z
    .object({
      current: z.number().int().nonnegative().optional(),
      longest: z.number().int().nonnegative().optional()
    })
    .optional(),
  recommendation: z.string().optional()
});

export const WeeklyReportInsertSchema = z.object({
  user_id: z.string().uuid(),
  week_start: z.string(),
  week_end: z.string(),
  timezone: z.string(),
  payload: WeeklyReportPayloadSchema,
  notification_status: z.enum(['pending', 'sent', 'failed']).default('pending')
});

export type WeeklyReportInsert = z.infer<typeof WeeklyReportInsertSchema>;

export const NotificationQueueInsertSchema = z.object({
  user_id: z.string().uuid(),
  channel: z.enum(['push', 'email', 'in_app']),
  payload: z.record(z.string(), z.any()),
  status: z.enum(['pending', 'sent', 'failed', 'retry']).default('pending'),
  next_attempt_at: z.string().optional()
});

export type NotificationQueueInsert = z.infer<typeof NotificationQueueInsertSchema>;

export const EmergencyOverrideInsertSchema = z.object({
  interception_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  reason: z.string().min(10),
  contact_note: z.string().optional(),
  follow_up_required: z.boolean().default(true)
});

export type EmergencyOverrideInsert = z.infer<typeof EmergencyOverrideInsertSchema>;
