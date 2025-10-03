import { supabase } from './supabaseClient';

export type InterceptSessionPayload = {
  sessionId?: string;
  userId: string;
  ruleId: string;
  personaKey: 'strict-father' | 'rational-mentor' | 'humor-coach';
  reason: string;
  trigger: 'quota_exceeded' | 'blocked_window' | 'cooldown_active';
};

export type InterceptSessionResponse = {
  session_id: string;
  ai_verdict: 'deny' | 'delay' | 'allow';
  persona_response: string;
  delay_minutes?: number;
  metadata?: Record<string, unknown>;
  entry_id?: string;
};

export async function callInterceptSession(payload: InterceptSessionPayload): Promise<InterceptSessionResponse> {
  if (!supabase) {
    // Fallback to heuristic similar to Edge Function
    const allow = /紧急|火警|emergency|医院/.test(payload.reason);
    return {
      session_id: payload.sessionId ?? '00000000-0000-0000-0000-000000000000',
      ai_verdict: allow ? 'allow' : 'delay',
      persona_response: allow ? '这次临时同意，完成后立即复盘。' : '设个15分钟缓冲，回来继续执行。',
      delay_minutes: allow ? undefined : 15,
      metadata: { reason_category: allow ? 'emergency' : 'other' },
      entry_id: undefined
    };
  }

  const { data, error } = await supabase.functions.invoke<InterceptSessionResponse>('intercept-session', {
    body: {
      session_id: payload.sessionId,
      user_id: payload.userId,
      rule_id: payload.ruleId,
      persona_key: payload.personaKey,
      reason: payload.reason,
      trigger: payload.trigger
    }
  });

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to call intercept-session');
  }

  return data;
}
