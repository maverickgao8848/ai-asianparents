import { supabase } from './client.ts';
import { AggregatedReport } from './schema.ts';
import { WeeklyReportInsertSchema } from '../../../../packages/lib-supabase/src/weeklyReports.ts';

const FALLBACK_REPORT: AggregatedReport = {
  user_id: '00000000-0000-0000-0000-000000000000',
  week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  week_end: new Date().toISOString().slice(0, 10),
  timezone: 'Asia/Shanghai',
  payload: {
    apps: [{ app_identifier: 'com.zhiliaoapp.musically', total_minutes: 120, overrides: 2 }],
    interceptions: { attempts: 4, compliance_rate: 0.75 },
    top_reasons: [{ category: 'work', count: 2, sample: '加班会议' }],
    streak: { current: 3, longest: 7 },
    recommendation: '继续保持晚间不刷短视频的习惯。'
  }
};

async function loadUsers(limit: number, cursor?: string) {
  if (!supabase) return [];
  let query = supabase
    .from('profiles')
    .select('id, timezone, created_at')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (cursor) {
    query = query.gt('created_at', cursor);
  }
  const { data, error } = await query;
  if (error || !data) {
    console.error('Failed to load profiles', error);
    return [];
  }
  return data;
}

async function aggregateForUser(userId: string, weekStart: string, weekEnd: string) {
  if (!supabase) {
    return FALLBACK_REPORT.payload;
  }

  const { data: interceptions, error: interceptionsError } = await supabase
    .from('interceptions')
    .select('id, final_decision, created_at')
    .eq('user_id', userId)
    .gte('created_at', `${weekStart}T00:00:00Z`)
    .lte('created_at', `${weekEnd}T23:59:59Z`);

  if (interceptionsError) {
    console.error('Failed to fetch interceptions', interceptionsError);
    return FALLBACK_REPORT.payload;
  }

  const attempts = interceptions?.length ?? 0;
  const compliance = interceptions?.filter((it) => it.final_decision === 'comply').length ?? 0;
  const complianceRate = attempts > 0 ? compliance / attempts : 1;

  const { data: reasons, error: reasonsError } = await supabase
    .from('interception_entries')
    .select('reason_category, user_reason')
    .in('interception_id', interceptions?.map((it) => it.id) ?? []);

  if (reasonsError) {
    console.error('Failed to fetch interception entries', reasonsError);
  }

  const reasonCount = new Map<string, { count: number; sample?: string }>();
  for (const row of reasons ?? []) {
    const key = row.reason_category ?? 'other';
    if (!reasonCount.has(key)) {
      reasonCount.set(key, { count: 0, sample: row.user_reason ?? '' });
    }
    const value = reasonCount.get(key)!;
    value.count += 1;
  }

  const topReasons = Array.from(reasonCount.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([category, info]) => ({ category, count: info.count, sample: info.sample }));

  return {
    apps: FALLBACK_REPORT.payload.apps,
    interceptions: { attempts, compliance_rate: Number(complianceRate.toFixed(2)) },
    top_reasons: topReasons,
    streak: FALLBACK_REPORT.payload.streak,
    recommendation: FALLBACK_REPORT.payload.recommendation
  };
}

export async function aggregateWeeklyData(limit = 50, cursor?: string): Promise<AggregatedReport[]> {
  if (!supabase) {
    return [FALLBACK_REPORT];
  }

  const users = await loadUsers(limit, cursor);
  if (!users.length) {
    return [FALLBACK_REPORT];
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const week_start = weekStart.toISOString().slice(0, 10);
  const week_end = now.toISOString().slice(0, 10);

  const reports: AggregatedReport[] = [];

  for (const user of users) {
    const payload = await aggregateForUser(user.id, week_start, week_end);
    const report = {
      user_id: user.id,
      week_start,
      week_end,
      timezone: user.timezone ?? 'Asia/Shanghai',
      payload
    } satisfies AggregatedReport;

    const parsed = WeeklyReportInsertSchema.safeParse({
      user_id: report.user_id,
      week_start,
      week_end,
      timezone: report.timezone,
      payload: report.payload
    });

    if (!parsed.success) {
      console.error('Invalid weekly report payload', parsed.error);
      continue;
    }

    await supabase
      .from('weekly_reports')
      .upsert(
        {
          user_id: report.user_id,
          week_start,
          week_end,
          timezone: report.timezone,
          payload: report.payload,
          notification_status: 'pending'
        },
        { onConflict: 'user_id,week_start' }
      );

    reports.push(report);
  }

  return reports;
}
