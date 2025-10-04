import { matchApp } from './appDictionary.ts';
import { ParseRuleRequest, RuleDraftSchema } from './schema.ts';

const WEEKDAY_KEYWORDS = ['weekday', 'weekdays', '工作日'];
const WEEKEND_KEYWORDS = ['weekend', 'weekends', '周末'];
const DAY_MAP: Record<string, string> = {
  monday: 'mon',
  mon: 'mon',
  mondaycn: 'mon',
  周一: 'mon',
  tuesday: 'tue',
  tue: 'tue',
  周二: 'tue',
  wednesday: 'wed',
  wed: 'wed',
  周三: 'wed',
  thursday: 'thu',
  thu: 'thu',
  周四: 'thu',
  friday: 'fri',
  fri: 'fri',
  周五: 'fri',
  saturday: 'sat',
  sat: 'sat',
  周六: 'sat',
  sunday: 'sun',
  sun: 'sun',
  周日: 'sun',
  周天: 'sun'
};

const DURATION_REGEX = /(?:<=?|小于等于|少于|最多|不超过)?\s*(\d{1,3})\s*(分钟|min|mins|minutes|小时|hours?)/i;
const TIME_WINDOW_REGEX = /(\d{1,2})(?::(\d{2}))?\s*(?:-|to|~|—|–|到|至)\s*(\d{1,2})(?::(\d{2}))?/i;

function normalizeMinutes(value: number, unit: string) {
  if (/小时|hour/i.test(unit)) {
    return value * 60;
  }
  return value;
}

function formatTime(hourStr: string, minuteStr?: string) {
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;
  const normalizedHour = Math.min(Math.max(hour, 0), 23);
  const normalizedMinute = Math.min(Math.max(minute, 0), 59);
  return `${normalizedHour.toString().padStart(2, '0')}:${normalizedMinute
    .toString()
    .padStart(2, '0')}`;
}

function detectDays(text: string): string[] | undefined {
  const lower = text.toLowerCase();
  if (WEEKDAY_KEYWORDS.some((kw) => lower.includes(kw))) {
    return ['mon', 'tue', 'wed', 'thu', 'fri'];
  }
  if (WEEKEND_KEYWORDS.some((kw) => lower.includes(kw))) {
    return ['sat', 'sun'];
  }
  const found = new Set<string>();
  for (const [key, day] of Object.entries(DAY_MAP)) {
    if (lower.includes(key)) {
      found.add(day);
    }
  }
  return found.size ? Array.from(found) : undefined;
}

function detectDuration(text: string) {
  const match = text.match(DURATION_REGEX);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  if (!Number.isFinite(value)) return null;
  const unit = match[2];
  return normalizeMinutes(value, unit);
}

function detectTimeWindows(text: string) {
  const match = text.match(TIME_WINDOW_REGEX);
  if (!match) return undefined;
  const start = formatTime(match[1], match[2]);
  const end = formatTime(match[3], match[4]);
  return [{ start, end }];
}

export function buildRuleDraft(payload: ParseRuleRequest) {
  const warnings: string[] = [];
  const errors: string[] = [];

  const appProfile = matchApp(payload.text);
  let app_identifier: string | null = null;
  let app_display_name: string | undefined;
  let platform: 'android' | 'ios' | 'web' | 'other' = 'android';

  if (appProfile) {
    app_identifier = appProfile.identifier;
    app_display_name = appProfile.displayName;
    platform = appProfile.platform;
  } else {
    warnings.push('未识别的应用，请确认包名。');
  }

  const limit_minutes = detectDuration(payload.text);
  if (!limit_minutes) {
    warnings.push('未能解析时长限制，保存前请确认。');
  }

  const time_windows = detectTimeWindows(payload.text);
  const days_of_week = detectDays(payload.text);

  const ruleDraft = RuleDraftSchema.parse({
    app_identifier,
    app_display_name,
    platform,
    limit_minutes: limit_minutes ?? undefined,
    days_of_week,
    constraints: {
      time_windows,
      daily_quota_minutes: limit_minutes ?? undefined
    }
  });

  const duplicate = payload.history.find(
    (item) =>
      app_identifier &&
      item.app_identifier === app_identifier &&
      (limit_minutes ? item.limit_minutes === limit_minutes : true)
  );
  if (duplicate) {
    warnings.push('现有规则已存在，确认后将覆盖。');
  }

  if (!app_identifier) {
    errors.push('无法确定目标应用。');
  }

  return {
    ruleDraft: errors.length ? null : ruleDraft,
    warnings,
    errors
  };
}
