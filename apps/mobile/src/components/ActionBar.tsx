import { View, StyleSheet, Pressable, Text } from 'react-native';

type ActionKey = 'comply' | 'override' | 'emergency';

interface ActionBarProps {
  onAction: (key: ActionKey) => void;
  disabled?: boolean;
  verdictState: 'pending' | 'deny' | 'delay' | 'allow';
}

const ACTION_LABELS: Record<ActionKey, string> = {
  comply: '遵守规则',
  override: '仍要解锁',
  emergency: '紧急情况'
};

export function ActionBar({ onAction, disabled = false, verdictState }: ActionBarProps) {
  const overrideDisabled = verdictState === 'pending';
  return (
    <View style={styles.container}>
      <Pressable
        testID="action-comply"
        style={({ pressed }) => [
          styles.button,
          styles.primary,
          (disabled || verdictState === 'pending') && styles.disabled,
          pressed && !disabled ? styles.pressed : null
        ]}
        disabled={disabled || verdictState === 'pending'}
        onPress={() => onAction('comply')}
      >
        <Text style={styles.primaryText}>{ACTION_LABELS.comply}</Text>
      </Pressable>
      <Pressable
        testID="action-override"
        style={({ pressed }) => [
          styles.button,
          styles.secondary,
          (disabled || overrideDisabled) && styles.disabled,
          pressed && !disabled ? styles.pressedSecondary : null
        ]}
        disabled={disabled || overrideDisabled}
        onPress={() => onAction('override')}
      >
        <Text style={styles.secondaryText}>{ACTION_LABELS.override}</Text>
      </Pressable>
      <Pressable
        testID="action-emergency"
        style={({ pressed }) => [
          styles.button,
          styles.emergency,
          disabled && styles.disabled,
          pressed && !disabled ? styles.pressedEmergency : null
        ]}
        disabled={disabled}
        onPress={() => onAction('emergency')}
      >
        <Text style={styles.emergencyText}>{ACTION_LABELS.emergency}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: '#0f172a'
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#0f172a',
    backgroundColor: '#ffffff'
  },
  secondaryText: {
    color: '#0f172a',
    fontWeight: '600'
  },
  emergency: {
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: '#fff1f2'
  },
  emergencyText: {
    color: '#b91c1c',
    fontWeight: '600'
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    backgroundColor: '#1f2937'
  },
  pressedSecondary: {
    backgroundColor: '#f1f5f9'
  },
  pressedEmergency: {
    backgroundColor: '#fee2e2'
  }
});
