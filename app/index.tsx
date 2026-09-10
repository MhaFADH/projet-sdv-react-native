import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lireRecherche } from '@/domain/criteres-ouvrages';
import { lireNumeroPage } from '@/domain/ouvrage';
import { FondsScreen } from '@/features/books/fonds-screen';
import { useRafraichirFondsAuFocus } from '@/hooks/use-rafraichir-fonds-au-focus';
import { theme } from '@/theme/tokens';

const FondsRoute = () => {
  const router = useRouter();
  const parametres = useLocalSearchParams<{ page?: string; q?: string }>();
  const pageDemandee = lireNumeroPage(parametres.page);
  const rechercheDemandee = lireRecherche(parametres.q);
  useRafraichirFondsAuFocus(pageDemandee, rechercheDemandee);

  const changerPage = useCallback(
    (page: number) => router.setParams({ page: String(page) }),
    [router],
  );
  const changerRecherche = useCallback(
    (recherche: string) => router.setParams({ page: '1', q: recherche || undefined }),
    [router],
  );
  const ouvrirOuvrage = useCallback(
    (id: string) =>
      router.push({
        pathname: '/ouvrages/[id]',
        params: {
          id,
          retourPage: String(pageDemandee),
          retourRecherche: rechercheDemandee,
        },
      }),
    [pageDemandee, rechercheDemandee, router],
  );
  const ajouterOuvrage = useCallback(() => router.push('/ouvrages/nouveau'), [router]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <FondsScreen
        ajouterOuvrage={ajouterOuvrage}
        changerPage={changerPage}
        changerRecherche={changerRecherche}
        ouvrirOuvrage={ouvrirOuvrage}
        pageDemandee={pageDemandee}
        rechercheDemandee={rechercheDemandee}
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
