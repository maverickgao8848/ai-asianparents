import { supabase } from './supabaseClient';

export type ParseRuleRequest = {
  text: string;
  timezone?: string;
  locale?: string;
  history?: Array<{ app_identifier: string; limit_minutes?: number; status?: string }>;
};

export type ParseRuleResponse = {
  ruleDraft: {
    app_identifier: string | null;
    app_display_name?: string;
    platform?: 'android' | 'ios' | 'web' | 'other';
    limit_minutes?: number;
    days_of_week?: string[];
    constraints?: Record<string, unknown>;
  } | null;
  warnings: string[];
  errors: string[];
};

export async function parseRule(payload: ParseRuleRequest): Promise<ParseRuleResponse> {
  if (!supabase) {
    return {
      ruleDraft: null,
      warnings: ['Supabase 未配置，当前为本地模拟模式。'],
      errors: []
    };
  }

  const { data, error } = await supabase.functions.invoke<ParseRuleResponse>('parse-rule', {
    body: payload
  });

  if (error || !data) {
    throw new Error(error?.message ?? '无法解析规则');
  }

  return data;
}
