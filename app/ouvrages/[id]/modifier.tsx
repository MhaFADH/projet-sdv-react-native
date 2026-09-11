import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CorrectionOuvrageScreen } from '@/features/books/correction-ouvrage-screen';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

const CorrectionRoute = () => {
  const styles = useStylesTheme(creerStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const retourAuFonds = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <CorrectionOuvrageScreen
        id={id ?? ''}
        ouvrirOuvrage={(ouvrageId: string) =>
          router.push({ pathname: '/ouvrages/[id]', params: { id: ouvrageId } })
        }
        retourAuFonds={retourAuFonds}
      />
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

export default CorrectionRoute;
