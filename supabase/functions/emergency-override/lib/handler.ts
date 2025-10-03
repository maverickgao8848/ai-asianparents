import { supabase } from './client.ts';
import { EmergencyRequest } from './schema.ts';

const COOLDOWN_MINUTES = 180;
const WEEKLY_LIMIT = 2;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export async function handleEmergencyOverride(payload: EmergencyRequest) {
  if (!supabase) {
    return {
      allowed: true,
      message: '模拟环境下自动允许紧急解锁。'
    };
  }

  const now = new Date();
  const cooldownThreshold = addMinutes(now, -COOLDOWN_MINUTES).toISOString();
  const weekThreshold = addMinutes(now, -7 * 24 * 60).toISOString();

  const [{ data: recentOverrides, error: recentError }, weeklyCount] = await Promise.all([
    supabase
      .from('emergency_overrides')
      .select('id, created_at')
      .eq('user_id', payload.user_id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('emergency_overrides')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', payload.user_id)
      .gte('created_at', weekThreshold)
  ]);

  if (recentError || weeklyCount.error) {
    console.error('Failed to query emergency overrides', recentError ?? weeklyCount.error);
    return {
      allowed: false,
      message: '系统繁忙，请稍后再试。'
    };
  }

  if (recentOverrides && recentOverrides.length > 0) {
    const lastOverride = new Date(recentOverrides[0].created_at);
    if (lastOverride > new Date(cooldownThreshold)) {
      const nextAttempt = addMinutes(lastOverride, COOLDOWN_MINUTES).toISOString();
      return {
        allowed: false,
        message: '刚刚触发过紧急解锁，请稍后再试。',
        cooldown_minutes: COOLDOWN_MINUTES,
        next_attempt_at: nextAttempt
      };
    }
  }

  const weeklyUsage = weeklyCount.count ?? 0;
  if (weeklyUsage >= WEEKLY_LIMIT) {
    return {
      allowed: false,
      message: '本周紧急解锁次数已达上限，如需更多支持请联系管理员。'
    };
  }

  const insertResult = await supabase
    .from('emergency_overrides')
    .insert({
      user_id: payload.user_id,
      interception_id: payload.rule_id ?? null,
      reason: payload.reason,
      contact_note: payload.contact_note ?? null,
      follow_up_required: payload.follow_up_required ?? true
    })
    .select('id')
    .maybeSingle();

  if (insertResult.error) {
    console.error('Failed to insert emergency override', insertResult.error);
    return {
      allowed: false,
      message: '系统繁忙，请稍后再试。'
    };
  }

  // Schedule follow-up task by inserting into notification queue (optional)
  await supabase.from('notification_queue').insert({
    user_id: payload.user_id,
    channel: 'push',
    payload: {
      title: '紧急事件复盘提醒',
      body: '3 小时后记得回来确认这次紧急事项是否处理完成。',
      type: 'emergency_followup'
    }
  });

  return {
    allowed: true,
    message: '已记录紧急解锁，请尽快处理并在稍后复盘。',
    cooldown_minutes: COOLDOWN_MINUTES,
    next_attempt_at: addMinutes(now, COOLDOWN_MINUTES).toISOString()
  };
}
