import { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  Alert,
  Pressable
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { PersonaHeader } from '../components/PersonaHeader';
import { ReasonInput } from '../components/ReasonInput';
import { VerdictCard, VerdictState } from '../components/VerdictCard';
import { ActionBar } from '../components/ActionBar';
import { EmergencySheet } from '../components/EmergencySheet';
import { usePersona, PersonaKey } from '../hooks/usePersona';
import { callInterceptSession } from '../services/interceptSession';
import { logDecision } from '../services/logDecision';

const MOCK_SESSION = {
  persona: 'strict-father' as PersonaKey,
  streak: 4,
  overrideCountToday: 1,
  ruleSummary: '工作日晚间 21:00-23:00 禁止刷短视频',
  appName: 'TikTok',
  ruleId: '11111111-1111-1111-1111-111111111111',
  userId: '00000000-0000-0000-0000-000000000001'
};

export function InterceptDialogScreen() {
  const { persona, getPrompt } = usePersona(MOCK_SESSION.persona);
  const [reason, setReason] = useState('');
  const [verdictState, setVerdictState] = useState<VerdictState>('pending');
  const [personaResponse, setPersonaResponse] = useState<string | undefined>();
  const [delayMinutes, setDelayMinutes] = useState<number | undefined>();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [entryId, setEntryId] = useState<string | undefined>();

  const canEvaluate = useMemo(() => reason.trim().length >= 15, [reason]);

  useEffect(() => {
    setVerdictState('pending');
    setPersonaResponse(undefined);
    setDelayMinutes(undefined);
  }, [persona]);

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      if (!canEvaluate) {
        throw new Error('说明不足');
      }
      return callInterceptSession({
        sessionId,
        userId: MOCK_SESSION.userId,
        ruleId: MOCK_SESSION.ruleId,
        personaKey: MOCK_SESSION.persona,
        reason,
        trigger: 'quota_exceeded'
      });
    },
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setEntryId(data.entry_id);
      setVerdictState(data.ai_verdict);
      setPersonaResponse(data.persona_response ?? getPrompt(data.ai_verdict));
      setDelayMinutes(data.delay_minutes);
      setIsEvaluating(false);
    },
    onError: (error) => {
      console.error(error);
      Alert.alert('服务器忙', '暂时无法完成严父评估，请稍后再试。');
      setIsEvaluating(false);
    }
  });

  function evaluateReason() {
    if (!canEvaluate) {
      Alert.alert('说明不足', '请至少输入 15 个字描述紧急情况或理由。');
      return;
    }
    setIsEvaluating(true);
    setVerdictState('pending');
    setPersonaResponse(undefined);
    setDelayMinutes(undefined);
    evaluateMutation.mutate();
  }

  const decisionMutation = useMutation({
    mutationFn: async (params: { decision: 'comply' | 'override' | 'emergency'; emergencyReason?: string; emergencyContact?: string }) => {
      if (!sessionId) {
        throw new Error('请先提交理由让严父评估。');
      }
      return logDecision({
        sessionId,
        entryId,
        userId: MOCK_SESSION.userId,
        decision: params.decision,
        emergencyReason: params.emergencyReason,
        emergencyContact: params.emergencyContact
      });
    },
    onSuccess: (_, variables) => {
      if (variables.decision === 'comply') {
        Alert.alert('已记录', '感谢遵守规则，严父为你记录一次坚持。');
      } else if (variables.decision === 'override') {
        Alert.alert('仍要解锁', '系统已记录本次破戒，你的周报会反映本次决定。');
      } else {
        Alert.alert('紧急解锁已记录', variables.emergencyContact ? `已备注联系人：${variables.emergencyContact}` : '记得稍后回来复盘。');
      }
    },
    onError: (error) => {
      console.error(error);
      Alert.alert('记录失败', '无法记录本次决定，请稍后重试。');
    }
  });

  const decisionPending = decisionMutation.isLoading;

  function handleAction(key: 'comply' | 'override' | 'emergency') {
    if (decisionPending || isEvaluating) {
      return;
    }
    if (key === 'emergency') {
      if (!sessionId) {
        Alert.alert('请先提交理由', '请先让严父评估一次理由，再尝试紧急解锁。');
        return;
      }
      setEmergencyVisible(true);
      return;
    }
    if (!sessionId) {
      Alert.alert('请先说明理由', '请先提交理由让严父评估，再决定是否解锁。');
      return;
    }
    decisionMutation.mutate({ decision: key });
  }

  function handleEmergencySubmit(emergencyReason: string, contact?: string) {
    setEmergencyVisible(false);
    decisionMutation.mutate({ decision: 'emergency', emergencyReason, emergencyContact: contact });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <PersonaHeader persona={persona} streak={MOCK_SESSION.streak} />
        </View>
        <View style={styles.section}>
          <Text style={styles.ruleSummary}>{MOCK_SESSION.ruleSummary}</Text>
          <Text style={styles.appName}>当前应用：{MOCK_SESSION.appName}</Text>
        </View>
        <View style={styles.section}>
          <ReasonInput value={reason} onChange={setReason} editable={!isEvaluating && !decisionPending} />
          <Pressable
            testID="submit-reason"
            style={[styles.evaluateButton, !canEvaluate && styles.evaluateDisabled]}
            onPress={evaluateReason}
            disabled={!canEvaluate || isEvaluating || decisionPending}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canEvaluate || isEvaluating || decisionPending }}
          >
            <Text style={styles.evaluateText}>{isEvaluating ? '严父正在评估…' : '提交理由'}</Text>
          </Pressable>
        </View>
        <View style={styles.section}>
          <VerdictCard state={verdictState} personaResponse={personaResponse} delayMinutes={delayMinutes} />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <ActionBar onAction={handleAction} verdictState={verdictState} disabled={isEvaluating || decisionPending} />
      </View>
      <EmergencySheet
        visible={emergencyVisible}
        onClose={() => setEmergencyVisible(false)}
        onSubmit={handleEmergencySubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: {
    padding: 20,
    paddingBottom: 120,
    gap: 20
  },
  section: {
    gap: 12
  },
  ruleSummary: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600'
  },
  appName: {
    fontSize: 14,
    color: '#4b5563'
  },
  evaluateButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  evaluateDisabled: {
    opacity: 0.5
  },
  evaluateText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  }
});
