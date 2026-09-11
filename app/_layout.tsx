import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalErrorView } from '@/components/global-error-view';
import { BasculesProvider } from '@/features/books/bascules-provider';
import { SuppressionsProvider } from '@/features/books/suppressions-provider';
import { PreferencesProvider } from '@/features/preferences/preferences-provider';
import { usePreferences } from '@/hooks/use-preferences';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

const queryClient = new QueryClient();

const ErreurGlobale = ({ retry }: ErrorBoundaryProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <GlobalErrorView retry={retry} />
    </SafeAreaView>
  );
};

export const ErrorBoundary = (proprietes: ErrorBoundaryProps) => (
  <PreferencesProvider>
    <ErreurGlobale {...proprietes} />
  </PreferencesProvider>
);

const ApplicationThemee = () => {
  const { apparence } = usePreferences();
  const styles = useStylesTheme(creerStyles);

  return (
    <ThemeProvider value={apparence === 'sombre' ? DarkTheme : DefaultTheme}>
      <SuppressionsProvider>
        <BasculesProvider>
          <Stack
            screenOptions={{
              contentStyle: styles.contenu,
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="preferences" />
            <Stack.Screen name="ouvrages/nouveau" />
            <Stack.Screen name="ouvrages/[id]" />
          </Stack>
          <StatusBar style={apparence === 'sombre' ? 'light' : 'dark'} />
        </BasculesProvider>
      </SuppressionsProvider>
    </ThemeProvider>
  );
};

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <PreferencesProvider>
      <ApplicationThemee />
    </PreferencesProvider>
  </QueryClientProvider>
);

const creerStyles = (themeActif: Theme) =>
  StyleSheet.create({
    contenu: { backgroundColor: themeActif.colors.background },
    page: {
      flex: 1,
      backgroundColor: themeActif.colors.background,
    },
  });

export default RootLayout;
