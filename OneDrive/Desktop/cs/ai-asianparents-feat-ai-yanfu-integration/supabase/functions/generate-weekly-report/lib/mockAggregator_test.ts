import { assertEquals } from 'std/testing/asserts.ts';
import { aggregateWeeklyData } from './aggregator.ts';

Deno.test('aggregateWeeklyData returns fallback reports when supabase unavailable', async () => {
  const reports = await aggregateWeeklyData(2);
  assertEquals(reports.length, 1);
  const report = reports[0];
  assertEquals(report.payload.apps[0].total_minutes, 120);
  assertEquals(report.timezone, 'Asia/Shanghai');
});
