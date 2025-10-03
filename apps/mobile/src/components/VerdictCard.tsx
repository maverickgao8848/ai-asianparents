import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export type VerdictState = 'pending' | 'deny' | 'delay' | 'allow';

interface VerdictCardProps {
  state: VerdictState;
  personaResponse?: string;
  delayMinutes?: number;
}

const STATE_COLORS: Record<VerdictState, string> = {
  pending: '#2563eb',
  deny: '#dc2626',
  delay: '#f59e0b',
  allow: '#16a34a'
};

const STATE_LABELS: Record<VerdictState, string> = {
  pending: '严父正在思考…',
  deny: '建议维持专注',
  delay: '建议稍后处理',
  allow: '本次破例允许'
};

export function VerdictCard({ state, personaResponse, delayMinutes }: VerdictCardProps) {
  return (
    <View style={[styles.container, { borderColor: STATE_COLORS[state] }]}> 
      <View style={[styles.badge, { backgroundColor: STATE_COLORS[state] }]}> 
        <Text style={styles.badgeText}>{STATE_LABELS[state]}</Text>
      </View>
      <View style={styles.body}>
        {state === 'pending' ? (
          <View style={styles.pendingRow}>
            <ActivityIndicator color={STATE_COLORS.pending} />
            <Text style={styles.pendingText}>严父正在评估你的理由…</Text>
          </View>
        ) : (
          <Text style={styles.response}>{personaResponse ?? '严父给出了建议。'}</Text>
        )}
        {state === 'delay' && delayMinutes ? (
          <Text style={styles.delayNote}>建议延后 {delayMinutes} 分钟后再尝试。</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  badgeText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 14
  },
  body: {
    padding: 16
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  pendingText: {
    fontSize: 16,
    color: '#1f2937'
  },
  response: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22
  },
  delayNote: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 8
  }
});
