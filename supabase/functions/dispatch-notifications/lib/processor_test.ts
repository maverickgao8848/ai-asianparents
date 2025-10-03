import { assertEquals } from 'std/testing/asserts.ts';
import { processQueue } from './processor.ts';

Deno.test('processQueue dry run when supabase unavailable', async () => {
  const result = await processQueue(10);
  assertEquals(result.sent, 0);
  assertEquals(result.processed, 0);
});
