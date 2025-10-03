import { supabase } from './supabaseClient';

export type RuleInsert = {
  userId: string;
  appIdentifier: string;
  appDisplayName?: string;
  platform?: 'android' | 'ios' | 'web' | 'other';
  limitMinutes?: number;
  daysOfWeek?: string[];
  constraints?: Record<string, unknown>;
};

export async function createRule(payload: RuleInsert) {
  if (!supabase) {
    return { message: 'Supabase 未配置，跳过保存。' };
  }

  const { error } = await supabase.from('rules').insert({
    user_id: payload.userId,
    app_identifier: payload.appIdentifier,
    app_display_name: payload.appDisplayName,
    platform: payload.platform,
    limit_minutes: payload.limitMinutes,
    days_of_week: payload.daysOfWeek,
    constraints: payload.constraints ?? {}
  });

  if (error) {
    throw new Error(error.message);
  }
}
