import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Pressable, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterceptDialogScreen } from './screens/InterceptDialogScreen';
import { RuleCreationScreen } from './screens/RuleCreationScreen';
import { useState } from 'react';

const queryClient = new QueryClient();

export default function App() {
  const [active, setActive] = useState<'intercept' | 'rule'>('intercept');
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.tabBar}>
          <TabButton label="拦截对话" active={active === 'intercept'} onPress={() => setActive('intercept')} />
          <TabButton label="规则创建" active={active === 'rule'} onPress={() => setActive('rule')} />
        </View>
        {active === 'intercept' ? <InterceptDialogScreen /> : <RuleCreationScreen />}
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 12
  }
});

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: active ? '#0f172a' : '#e2e8f0',
        alignItems: 'center'
      }}
    >
      <Text style={{ color: active ? '#ffffff' : '#1f2937', fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
