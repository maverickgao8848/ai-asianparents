import { supabase } from './client.ts';
import { InterceptRequest } from './schema.ts';
import { renderPrompt } from './personas.ts';
import { classifyReason } from './classifier.ts';

const DELAY_MINUTES = 15;

function heuristicVerdict(reason: string) {
  const text = reason.trim();
  const lower = text.toLowerCase();
  if (/紧急|火警|医院|emergency/.test(text)) {
    return { verdict: 'allow' as const, personaVars: {} };
  }
  if (text.length > 80 || /项目|deadline|客户/.test(text)) {
    return { verdict: 'allow' as const, personaVars: {} };
  }
  if (text.length > 50) {
    return { verdict: 'delay' as const, personaVars: { delay_minutes: DELAY_MINUTES } };
  }
  if (/放松|刷刷|摸鱼/.test(text)) {
    return { verdict: 'deny' as const, personaVars: { next_action: '完成当前任务' } };
  }
  if (text.length > 30) {
    return { verdict: 'delay' as const, personaVars: { delay_minutes: DELAY_MINUTES } };
  }
  return { verdict: 'deny' as const, personaVars: { next_action: '完成当前任务' } };
}

async function ensureInterceptionSession(payload: InterceptRequest) {
  if (!supabase) {
    return payload.session_id ?? '00000000-0000-0000-0000-000000000000';
  }
  if (payload.session_id) {
    return payload.session_id;
  }
  const { data, error } = await supabase
    .from('interceptions')
    .insert({
      user_id: payload.user_id,
      rule_id: payload.rule_id,
      persona_key: payload.persona_key,
      trigger: payload.trigger,
      streak: 0,
      override_count_today: 0
    })
    .select('id')
    .single();
  if (error || !data) {
    throw new Error('无法创建拦截会话');
  }
  return data.id;
}

export async function handleInterceptSession(payload: InterceptRequest) {
  const { verdict, personaVars } = heuristicVerdict(payload.reason);
  const personaResponse = renderPrompt(payload.persona_key, verdict, {
    delay_minutes: DELAY_MINUTES,
    remaining_percent: 30,
    follow_up_minutes: 30,
    next_action: '完成当前任务',
    ...personaVars
  });

  const sessionId = await ensureInterceptionSession(payload);
  const reasonCategory = classifyReason(payload.reason);

  let entryId: string | undefined;

  if (supabase) {
    const { data: entryRow, error: entryError } = await supabase
      .from('interception_entries')
      .insert({
        interception_id: sessionId,
        turn: 1,
        user_reason: payload.reason,
        reason_category: reasonCategory,
        ai_verdict: verdict,
        persona_response: personaResponse
      })
      .select('id')
      .single();

    if (!entryError && entryRow) {
      entryId = entryRow.id;
    }

    await supabase
      .from('interceptions')
      .update({
        final_ai_verdict: verdict,
        final_reason_category: reasonCategory
      })
      .eq('id', sessionId);
  }

  return {
    session_id: sessionId,
    ai_verdict: verdict,
    persona_response: personaResponse,
    delay_minutes: verdict === 'delay' ? DELAY_MINUTES : undefined,
    metadata: {
      reason_category: reasonCategory
    },
    entry_id: entryId
  };
}
