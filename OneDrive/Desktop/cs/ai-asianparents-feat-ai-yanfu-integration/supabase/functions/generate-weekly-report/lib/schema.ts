import { z } from 'zod';

export const RequestSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().positive().max(200).optional()
});

export const AggregatedReportSchema = z.object({
  user_id: z.string().uuid(),
  week_start: z.string(),
  week_end: z.string(),
  timezone: z.string(),
  payload: z.record(z.any())
});

export type AggregatedReport = z.infer<typeof AggregatedReportSchema>;
