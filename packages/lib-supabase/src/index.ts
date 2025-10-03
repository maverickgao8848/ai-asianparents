import { createClient } from '@supabase/supabase-js';
export * from './types';
export * from './interceptions';
export * from './weeklyReports';

type SupabaseEnv = {
  url: string | undefined;
  anonKey: string | undefined;
};

const env: SupabaseEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
};

if (!env.url || !env.anonKey) {
  console.warn('Supabase environment variables are missing; client will not be initialized.');
}

export const supabase = env.url && env.anonKey ? createClient(env.url, env.anonKey) : undefined;
