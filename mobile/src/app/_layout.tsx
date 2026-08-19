import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TopBar } from '@/components/top-bar';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          header: ({ navigation }) => <TopBar canGoBack={navigation.canGoBack()} />,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ielts/exams" />
        <Stack.Screen name="ielts/[section]/index" />
        <Stack.Screen name="ielts/[section]/select" />
        <Stack.Screen name="practice/[slug]" />
        <Stack.Screen name="vocabulary" />
      </Stack>
    </SafeAreaProvider>
  );
}
