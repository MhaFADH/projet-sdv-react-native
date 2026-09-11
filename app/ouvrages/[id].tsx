import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FicheScreen } from '@/features/books/fiche-screen';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

const FicheRoute = () => {
  const styles = useStylesTheme(creerStyles);
  const router = useRouter();
  const { id, retourPage, retourRecherche, retourStatus, retourFavori, retourSort, retourOrder } =
    useLocalSearchParams<{
      id: string;
      retourPage?: string;
      retourRecherche?: string;
      retourStatus?: string;
      retourFavori?: string;
      retourSort?: string;
      retourOrder?: string;
    }>();
  const retour = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: '/',
      params: {
        page: retourPage ?? '1',
        q: retourRecherche ?? '',
        status: retourStatus,
        favori: retourFavori,
        sort: retourSort,
        order: retourOrder,
      },
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <FicheScreen
        corriger={() =>
          router.push({ pathname: '/ouvrages/[id]/modifier', params: { id: id ?? '' } })
        }
        id={id ?? ''}
        retour={retour}
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

export default FicheRoute;
