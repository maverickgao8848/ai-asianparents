import { View, Text, StyleSheet } from 'react-native';
import type { PersonaConfig } from '@ai-yanfu/config';

interface PersonaHeaderProps {
  persona: PersonaConfig;
  streak: number;
}

export function PersonaHeader({ persona, streak }: PersonaHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: persona.style?.background ?? '#f1f5f9' }]}> 
      <View style={[styles.avatar, { backgroundColor: persona.color }]}>
        <Text style={styles.avatarText}>{persona.name.charAt(0)}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{persona.name}</Text>
        <Text style={styles.tone}>{persona.tone}</Text>
      </View>
      <View style={styles.streakBadge}>
        <Text style={styles.streakLabel}>专注连胜</Text>
        <Text style={styles.streakValue}>{streak} 天</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600'
  },
  textContainer: {
    flex: 1
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  tone: {
    fontSize: 14,
    color: '#4b5563'
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderRadius: 12
  },
  streakLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  streakValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '600'
  }
});
