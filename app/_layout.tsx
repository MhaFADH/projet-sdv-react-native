import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalErrorView } from '@/components/global-error-view';
import { theme } from '@/theme/tokens';

const queryClient = new QueryClient();

export const ErrorBoundary = ({ retry }: ErrorBoundaryProps) => (
  <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
    <GlobalErrorView retry={retry} />
  </SafeAreaView>
);

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="ouvrages/nouveau" />
        <Stack.Screen name="ouvrages/[id]" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  </QueryClientProvider>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default RootLayout;
