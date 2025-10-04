import { useMemo } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface ReasonInputProps {
  value: string;
  onChange: (text: string) => void;
  editable?: boolean;
}

const MIN_LENGTH = 15;

export function ReasonInput({ value, onChange, editable = true }: ReasonInputProps) {
  const remaining = useMemo(() => Math.max(0, MIN_LENGTH - value.length), [value.length]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>说明你此刻想解锁的原因</Text>
      <TextInput
        style={styles.input}
        placeholder="例如：有紧急会议需要联系同事"
        multiline
        numberOfLines={4}
        value={value}
        onChangeText={onChange}
        editable={editable}
      />
      <Text style={[styles.helper, remaining > 0 && styles.helperWarning]}>
        {remaining > 0 ? `至少还需 ${remaining} 个字` : '感谢详细说明'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827'
  },
  input: {
    minHeight: 96,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#111827'
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b'
  },
  helperWarning: {
    color: '#dc2626'
  }
});
