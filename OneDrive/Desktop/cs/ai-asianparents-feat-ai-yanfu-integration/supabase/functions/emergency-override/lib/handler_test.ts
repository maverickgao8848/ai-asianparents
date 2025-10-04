import { assertEquals } from 'std/testing/asserts.ts';
import { handleEmergencyOverride } from './handler.ts';

Deno.test('handleEmergencyOverride returns allowed in dry mode', async () => {
  const result = await handleEmergencyOverride({
    user_id: '00000000-0000-0000-0000-000000000000',
    reason: '这是一个紧急情况说明，至少需要十五个字符。',
    follow_up_required: true
  });

  assertEquals(result.allowed, true);
});
