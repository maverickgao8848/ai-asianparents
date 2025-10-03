import { supabase } from './client.ts';
import { NotificationJobSchema } from './schema.ts';
import { sendEmail, sendInApp, sendPush } from './senders.ts';

const MAX_ATTEMPTS = 5;

export async function processQueue(limit = 50) {
  if (!supabase) {
    return {
      processed: 0,
      sent: 0,
      retried: 0,
      failed: 0
    };
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('notification_queue')
    .select('*')
    .in('status', ['pending', 'retry'])
    .lte('next_attempt_at', nowIso)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data?.length) {
    if (error) {
      console.error('Failed to fetch notification queue', error);
    }
    return {
      processed: 0,
      sent: 0,
      retried: 0,
      failed: 0
    };
  }

  let sent = 0;
  let retried = 0;
  let failed = 0;

  for (const rawJob of data) {
    const jobResult = NotificationJobSchema.safeParse(rawJob);
    if (!jobResult.success) {
      console.warn('Invalid notification job payload', jobResult.error);
      continue;
    }

    const job = jobResult.data;
    let success = false;
    let hardFailure = false;

    if (job.channel === 'push') {
      const result = await sendPush(job.payload as Record<string, unknown>);
      success = result.success;
      hardFailure = !success && result.reason === 'missing_expo_token';
    } else if (job.channel === 'email') {
      const result = await sendEmail(job.payload as Record<string, unknown>);
      success = result.success;
      hardFailure = !success && result.reason === 'missing_resend_key';
    } else {
      const result = await sendInApp(job.payload as Record<string, unknown>);
      success = result.success;
      // Insert into notifications feed on success
      if (success) {
        await supabase.from('notifications').insert({
          user_id: job.user_id,
          channel: 'in_app',
          title: (job.payload as Record<string, string>).title ?? '提醒',
          body: (job.payload as Record<string, string>).body ?? '',
          metadata: job.payload
        });
      }
    }

    const nextAttempt = job.attempt_count + 1;

    if (success) {
      sent += 1;
      await supabase
        .from('notification_queue')
        .update({ status: 'sent', attempt_count: nextAttempt })
        .eq('id', job.id);
      continue;
    }

    const nextStatus = hardFailure || nextAttempt >= MAX_ATTEMPTS ? 'failed' : 'retry';
    const backoffMinutes = Math.min(60, Math.pow(2, nextAttempt - 1));
    const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();

    if (nextStatus === 'failed') {
      failed += 1;
    } else {
      retried += 1;
    }

    await supabase
      .from('notification_queue')
      .update({
        status: nextStatus,
        attempt_count: nextAttempt,
        next_attempt_at: nextAttemptAt
      })
      .eq('id', job.id);
  }

  return {
    processed: data.length,
    sent,
    retried,
    failed
  };
}
