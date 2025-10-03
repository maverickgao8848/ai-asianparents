import { supabase } from './supabaseClient';

export type DecisionPayload = {
  sessionId: string;
  entryId?: string;
  userId: string;
  decision: 'comply' | 'override' | 'emergency';
  emergencyReason?: string;
  emergencyContact?: string;
};

export async function logDecision(payload: DecisionPayload) {
  if (!supabase) {
    return { message: '模拟环境下已记录决定。' };
  }

  const { data, error } = await supabase.functions.invoke('intercept-decision', {
    body: {
      session_id: payload.sessionId,
      entry_id: payload.entryId,
      user_id: payload.userId,
      decision: payload.decision,
      emergency_reason: payload.emergencyReason,
      emergency_contact: payload.emergencyContact
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
