import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

interface EmergencySheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, contact?: string) => void;
}

export function EmergencySheet({ visible, onClose, onSubmit }: EmergencySheetProps) {
  const [reason, setReason] = useState('');
  const [contactNote, setContactNote] = useState('');

  function handleSubmit() {
    if (reason.trim().length < 15) {
      return;
    }
    onSubmit(reason.trim(), contactNote.trim() || undefined);
    setReason('');
    setContactNote('');
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>紧急情况说明</Text>
          <Text style={styles.subtitle}>请描述紧急原因，严父会记录这次特殊处理。</Text>
          <TextInput
            style={styles.textArea}
            placeholder="例如：家里突发紧急情况需要联络家人"
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <TextInput
            style={styles.input}
            placeholder="（可选）是否需要通知的联系人信息"
            value={contactNote}
            onChangeText={setContactNote}
          />
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.submit, reason.trim().length < 15 && styles.disabled]}
              onPress={handleSubmit}
              disabled={reason.trim().length < 15}
            >
              <Text style={styles.submitText}>立即解锁</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)'
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  subtitle: {
    fontSize: 14,
    color: '#475569'
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#111827'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12
  },
  cancel: {
    backgroundColor: '#e2e8f0'
  },
  cancelText: {
    color: '#1f2937',
    fontWeight: '600'
  },
  submit: {
    backgroundColor: '#dc2626'
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  disabled: {
    opacity: 0.6
  }
});
