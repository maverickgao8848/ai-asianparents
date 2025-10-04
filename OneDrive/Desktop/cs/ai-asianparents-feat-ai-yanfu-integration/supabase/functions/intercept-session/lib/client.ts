import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

function safeEnv(key: string) {
  try {
    return Deno.env.get(key) ?? undefined;
  } catch (_error) {
    return undefined;
  }
}

const supabaseUrl = safeEnv('SUPABASE_URL');
const serviceRole = safeEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRole) {
  console.warn('Supabase credentials missing; intercept-session will operate in dry mode.');
}

export const supabase = supabaseUrl && serviceRole
  ? createClient(supabaseUrl, serviceRole)
  : undefined;
