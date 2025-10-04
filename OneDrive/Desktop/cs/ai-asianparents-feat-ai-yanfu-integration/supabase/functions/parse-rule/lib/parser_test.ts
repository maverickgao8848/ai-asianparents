import { assert, assertEquals } from 'std/testing/asserts.ts';
import { buildRuleDraft } from './parser.ts';
import { RequestSchema } from './schema.ts';

Deno.test('parse simple weekday restriction', () => {
  const payload = RequestSchema.parse({
    text: 'Weekdays 9-18 TikTok <= 20 minutes',
    locale: 'en-US',
    timezone: 'Asia/Shanghai'
  });

  const result = buildRuleDraft(payload);

  assert(result.ruleDraft);
  assertEquals(result.errors.length, 0);
  assertEquals(result.ruleDraft?.app_identifier, 'com.zhiliaoapp.musically');
  assertEquals(result.ruleDraft?.days_of_week?.length, 5);
  assertEquals(result.ruleDraft?.constraints.time_windows?.[0].start, '09:00');
  assertEquals(result.ruleDraft?.limit_minutes, 20);
});

Deno.test('warn when duration missing', () => {
  const payload = RequestSchema.parse({
    text: '周末不允许打开微信',
    locale: 'zh-CN'
  });

  const result = buildRuleDraft(payload);
  assert(result.warnings.some((w) => w.includes('时长')));
});

Deno.test('error when app unknown', () => {
  const payload = RequestSchema.parse({
    text: '限制使用神秘应用 30 分钟',
    locale: 'zh-CN'
  });

  const result = buildRuleDraft(payload);
  assert(result.errors.length > 0);
  assertEquals(result.ruleDraft, null);
});
