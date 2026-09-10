import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lireNumeroPage } from '@/domain/ouvrage';
import { FondsScreen } from '@/features/books/fonds-screen';
import { useRafraichirFondsAuFocus } from '@/hooks/use-rafraichir-fonds-au-focus';
import { theme } from '@/theme/tokens';

const FondsRoute = () => {
  const router = useRouter();
  const parametres = useLocalSearchParams<{ page?: string }>();
  const pageDemandee = lireNumeroPage(parametres.page);
  useRafraichirFondsAuFocus(pageDemandee);

  const changerPage = useCallback(
    (page: number) => router.setParams({ page: String(page) }),
    [router],
  );
  const ouvrirOuvrage = useCallback(
    (id: string) => router.push({ pathname: '/ouvrages/[id]', params: { id } }),
    [router],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <FondsScreen
        changerPage={changerPage}
        ouvrirOuvrage={ouvrirOuvrage}
        pageDemandee={pageDemandee}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default FondsRoute;
