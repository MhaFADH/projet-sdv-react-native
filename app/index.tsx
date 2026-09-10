import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  type ConsultationFonds,
  encoderConsultation,
  lireFiltreLecture,
  lireFiltreRecommandation,
  lireOrdreFonds,
  lireRecherche,
  lireTriFonds,
} from '@/domain/criteres-ouvrages';
import { lireNumeroPage } from '@/domain/ouvrage';
import { FondsScreen } from '@/features/books/fonds-screen';
import { useRafraichirFondsAuFocus } from '@/hooks/use-rafraichir-fonds-au-focus';
import { theme } from '@/theme/tokens';

const FondsRoute = () => {
  const router = useRouter();
  const parametres = useLocalSearchParams<{
    page?: string;
    q?: string;
    status?: string;
    favori?: string;
    sort?: string;
    order?: string;
  }>();
  const pageDemandee = lireNumeroPage(parametres.page);
  const consultationDemandee = useMemo<ConsultationFonds>(
    () => ({
      recherche: lireRecherche(parametres.q),
      lecture: lireFiltreLecture(parametres.status),
      recommandation: lireFiltreRecommandation(parametres.favori),
      tri: lireTriFonds(parametres.sort),
      ordre: lireOrdreFonds(parametres.order),
    }),
    [parametres.favori, parametres.order, parametres.q, parametres.sort, parametres.status],
  );
  useRafraichirFondsAuFocus(pageDemandee, consultationDemandee);

  const changerPage = useCallback(
    (page: number) => router.setParams({ page: String(page) }),
    [router],
  );
  const changerConsultation = useCallback(
    (consultation: ConsultationFonds) =>
      router.setParams({ page: '1', ...encoderConsultation(consultation) }),
    [router],
  );
  const ouvrirOuvrage = useCallback(
    (id: string) => {
      const retour = encoderConsultation(consultationDemandee);
      router.push({
        pathname: '/ouvrages/[id]',
        params: {
          id,
          retourPage: String(pageDemandee),
          retourRecherche: retour.q,
          retourStatus: retour.status,
          retourFavori: retour.favori,
          retourSort: retour.sort,
          retourOrder: retour.order,
        },
      });
    },
    [consultationDemandee, pageDemandee, router],
  );
  const ajouterOuvrage = useCallback(() => router.push('/ouvrages/nouveau'), [router]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <FondsScreen
        ajouterOuvrage={ajouterOuvrage}
        changerConsultation={changerConsultation}
        changerPage={changerPage}
        consultationDemandee={consultationDemandee}
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
