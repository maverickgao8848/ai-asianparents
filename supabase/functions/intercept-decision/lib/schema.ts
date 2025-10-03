import { z } from 'zod';

export const RequestSchema = z.object({
  session_id: z.string().uuid(),
  entry_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  decision: z.enum(['comply', 'override', 'emergency']),
  emergency_reason: z.string().optional(),
  emergency_contact: z.string().optional()
});

export const ResponseSchema = z.object({
  session_id: z.string().uuid(),
  decision: z.enum(['comply', 'override', 'emergency']),
  message: z.string()
});

export type DecisionRequest = z.infer<typeof RequestSchema>;
