import {
  WeeklyReportInsertSchema,
  NotificationQueueInsertSchema,
  EmergencyOverrideInsertSchema
} from '../weeklyReports';

describe('weekly reports schemas', () => {
  it('validates weekly report payload', () => {
    const result = WeeklyReportInsertSchema.parse({
      user_id: '7b28a86a-36dd-4576-9357-1c79f4c99b6c',
      week_start: '2024-02-12',
      week_end: '2024-02-18',
      timezone: 'Asia/Shanghai',
      payload: {
        apps: [
          { app_identifier: 'com.zhiliaoapp.musically', total_minutes: 120, overrides: 2 }
        ],
        interceptions: { attempts: 5, compliance_rate: 0.6 },
        recommendation: '下周尝试把娱乐时间提前到 21:30 之前。'
      }
    });

    expect(result.notification_status).toBe('pending');
  });

  it('validates notification queue payload', () => {
    const job = NotificationQueueInsertSchema.parse({
      user_id: '7b28a86a-36dd-4576-9357-1c79f4c99b6c',
      channel: 'push',
      payload: { title: 'test', body: 'body' }
    });

    expect(job.status).toBe('pending');
  });

  it('requires minimum reason for emergency override', () => {
    expect(() =>
      EmergencyOverrideInsertSchema.parse({
        user_id: '7b28a86a-36dd-4576-9357-1c79f4c99b6c',
        reason: '太短'
      })
    ).toThrow();
  });
});
