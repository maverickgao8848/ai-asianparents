import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { parseRule } from '../services/parseRule';
import { createRule } from '../services/rules';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export function RuleCreationScreen() {
  const [ruleText, setRuleText] = useState('');
  const [parsed, setParsed] = useState<{
    app_identifier: string | null;
    app_display_name?: string;
    platform?: 'android' | 'ios' | 'web' | 'other';
    limit_minutes?: number;
    days_of_week?: string[];
    constraints?: Record<string, unknown>;
  } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const parseMutation = useMutation({
    mutationFn: async () => {
      if (!ruleText.trim()) {
        throw new Error('请输入规则内容');
      }
      return parseRule({
        text: ruleText,
        timezone: 'Asia/Shanghai',
        locale: 'zh-CN'
      });
    },
    onSuccess: (data) => {
      setParsed(data.ruleDraft);
      setWarnings(data.warnings);
      setErrors(data.errors);
      if (data.errors.length === 0 && data.ruleDraft?.app_identifier) {
        Alert.alert('解析成功', '请确认规则详情并保存。');
      } else if (data.errors.length > 0) {
        Alert.alert('解析存在问题', data.errors.join('\n'));
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : '解析失败';
      Alert.alert('解析失败', message);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!parsed || !parsed.app_identifier) {
        throw new Error('请先成功解析规则。');
      }
      await createRule({
        userId: MOCK_USER_ID,
        appIdentifier: parsed.app_identifier,
        appDisplayName: parsed.app_display_name,
        platform: parsed.platform,
        limitMinutes: parsed.limit_minutes,
        daysOfWeek: parsed.days_of_week,
        constraints: parsed.constraints
      });
    },
    onSuccess: () => {
      Alert.alert('保存成功', '规则已保存到 Supabase。');
      setRuleText('');
      setParsed(null);
      setWarnings([]);
      setErrors([]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : '保存失败';
      Alert.alert('保存失败', message);
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>自然语言规则创建</Text>
        <Text style={styles.subtitle}>示例："工作日 9-18 点微信 ≤ 30 分钟"</Text>
        <TextInput
          style={styles.input}
          value={ruleText}
          onChangeText={setRuleText}
          placeholder="请输入规则描述"
          multiline
        />
        <Pressable
          style={[styles.button, parseMutation.isLoading && styles.buttonDisabled]}
          onPress={() => parseMutation.mutate()}
          disabled={parseMutation.isLoading}
        >
          <Text style={styles.buttonText}>{parseMutation.isLoading ? '解析中…' : '解析规则'}</Text>
        </Pressable>

        {parsed && (
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>解析结果</Text>
            <Text style={styles.cardRow}>应用：{parsed.app_display_name ?? parsed.app_identifier ?? '未识别'}</Text>
            <Text style={styles.cardRow}>平台：{parsed.platform ?? '未知'}</Text>
            <Text style={styles.cardRow}>限制：{parsed.limit_minutes ? `${parsed.limit_minutes} 分钟` : '未指定'}</Text>
            <Text style={styles.cardRow}>
              生效日：{parsed.days_of_week ? parsed.days_of_week.join(', ') : '未指定'}
            </Text>
          </View>
        )}

        {warnings.length > 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>警告</Text>
            {warnings.map((warning) => (
              <Text key={warning} style={styles.warningText}>
                • {warning}
              </Text>
            ))}
          </View>
        )}

        {errors.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>错误</Text>
            {errors.map((error) => (
              <Text key={error} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        <Pressable
          style={[styles.button, styles.saveButton, (!parsed || !parsed.app_identifier || errors.length > 0 || saveMutation.isLoading) && styles.buttonDisabled]}
          onPress={() => saveMutation.mutate()}
          disabled={!parsed || !parsed.app_identifier || errors.length > 0 || saveMutation.isLoading}
        >
          <Text style={styles.saveButtonText}>{saveMutation.isLoading ? '保存中…' : '确认保存'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 20,
    gap: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 14,
    color: '#475569'
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#d9e1ec',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    textAlignVertical: 'top',
    backgroundColor: '#ffffff'
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  cardRow: {
    fontSize: 14,
    color: '#4b5563'
  },
  warningBox: {
    backgroundColor: '#fef9c3',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#facc15'
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#854d0e'
  },
  warningText: {
    fontSize: 13,
    color: '#854d0e'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f87171'
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c'
  },
  errorText: {
    fontSize: 13,
    color: '#991b1b'
  },
  saveButton: {
    backgroundColor: '#0f172a'
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700'
  }
});
