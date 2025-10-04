import { z } from 'zod';

export const RequestSchema = z.object({
  limit: z.number().int().positive().max(100).optional()
});

export const NotificationJobSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  channel: z.enum(['push', 'email', 'in_app']),
  payload: z.record(z.any()),
  attempt_count: z.number().int().nonnegative().default(0)
});

export type NotificationJob = z.infer<typeof NotificationJobSchema>;
