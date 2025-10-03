import { z } from 'zod';

export const RequestSchema = z.object({
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  persona_key: z.enum(['strict-father', 'rational-mentor', 'humor-coach']),
  reason: z.string().min(10),
  trigger: z.enum(['quota_exceeded', 'blocked_window', 'cooldown_active'])
});

export const ResponseSchema = z.object({
  session_id: z.string().uuid(),
  ai_verdict: z.enum(['deny', 'delay', 'allow']),
  persona_response: z.string(),
  delay_minutes: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  entry_id: z.string().uuid().optional()
});

export type InterceptRequest = z.infer<typeof RequestSchema>;
