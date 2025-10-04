import { z } from 'zod';

export const RequestSchema = z.object({
  user_id: z.string().uuid(),
  rule_id: z.string().uuid().optional(),
  reason: z.string().min(15, '请详细说明紧急情况 (≥15 字)。'),
  contact_note: z.string().optional(),
  follow_up_required: z.boolean().optional()
});

export const ResponseSchema = z.object({
  allowed: z.boolean(),
  message: z.string(),
  cooldown_minutes: z.number().int().nonnegative().optional(),
  next_attempt_at: z.string().optional()
});

export type EmergencyRequest = z.infer<typeof RequestSchema>;
