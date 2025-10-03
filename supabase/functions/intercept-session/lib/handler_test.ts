import { assertEquals } from 'std/testing/asserts.ts';
import { handleInterceptSession } from './handler.ts';

Deno.test('handleInterceptSession returns dry-mode response when supabase missing', async () => {
  const result = await handleInterceptSession({
    user_id: '00000000-0000-0000-0000-000000000000',
    rule_id: '00000000-0000-0000-0000-000000000000',
    persona_key: 'strict-father',
    reason: '现在有紧急会议需要答复客户',
    trigger: 'quota_exceeded'
  });

  assertEquals(result.ai_verdict === 'allow' || result.ai_verdict === 'delay' || result.ai_verdict === 'deny', true);
  // entry_id may be undefined in dry mode
});
