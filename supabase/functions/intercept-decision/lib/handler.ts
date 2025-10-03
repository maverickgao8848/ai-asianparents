import { supabase } from './client.ts';
import { DecisionRequest } from './schema.ts';

async function updateEntry(interceptionId: string, entryId: string | undefined, decision: string) {
  if (!supabase) return;
  if (entryId) {
    await supabase
      .from('interception_entries')
      .update({ user_decision: decision })
      .eq('id', entryId);
  } else {
    await supabase
      .from('interception_entries')
      .update({ user_decision: decision })
      .eq('interception_id', interceptionId)
      .eq('turn', 1);
  }
}

async function logEmergency(payload: DecisionRequest) {
  if (!supabase) return;
  await supabase
    .from('emergency_overrides')
    .insert({
      user_id: payload.user_id,
      interception_id: payload.session_id,
      reason: payload.emergency_reason ?? '未提供原因',
      contact_note: payload.emergency_contact ?? null,
      follow_up_required: true
    });

  await supabase.from('notification_queue').insert({
    user_id: payload.user_id,
    channel: 'push',
    payload: {
      title: '紧急事件复盘提醒',
      body: '记得在处理完紧急事项后回来复盘。',
      type: 'emergency_followup'
    }
  });
}

export async function handleInterceptDecision(payload: DecisionRequest) {
  if (!supabase) {
    return {
      session_id: payload.session_id,
      decision: payload.decision,
      message: '模拟环境下已记录用户决定。'
    };
  }

  await updateEntry(payload.session_id, payload.entry_id, payload.decision);

  const updates: Record<string, unknown> = {
    final_decision: payload.decision,
    emergency_flag: payload.decision === 'emergency'
  };

  await supabase
    .from('interceptions')
    .update(updates)
    .eq('id', payload.session_id)
    .eq('user_id', payload.user_id);

  if (payload.decision === 'emergency') {
    await logEmergency(payload);
  }

  return {
    session_id: payload.session_id,
    decision: payload.decision,
    message: '已记录本次决定。'
  };
}
