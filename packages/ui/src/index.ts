import { Text, View, StyleSheet } from 'react-native';

export function PersonaBadge({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0f172a'
  },
  text: {
    fontSize: 14,
    color: '#ffffff'
  }
});
