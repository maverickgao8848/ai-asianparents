import { assertEquals } from 'std/testing/asserts.ts';
import { handleInterceptDecision } from './handler.ts';

Deno.test('handleInterceptDecision returns dry-mode response', async () => {
  const result = await handleInterceptDecision({
    session_id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000000',
    decision: 'comply',
    emergency_reason: undefined,
    emergency_contact: undefined
  });

  assertEquals(result.decision, 'comply');
});
