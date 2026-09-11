import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PreferencesScreen } from '@/features/preferences/preferences-screen';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

const PreferencesRoute = () => {
  const router = useRouter();
  const styles = useStylesTheme(creerStyles);
  const revenir = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <PreferencesScreen revenir={revenir} />
    </SafeAreaView>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

export default PreferencesRoute;
