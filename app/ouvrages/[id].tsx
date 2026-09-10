import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FicheScreen } from '@/features/books/fiche-screen';
import { theme } from '@/theme/tokens';

const FicheRoute = () => {
  const router = useRouter();
  const { id, retourPage, retourRecherche } = useLocalSearchParams<{
    id: string;
    retourPage?: string;
    retourRecherche?: string;
  }>();
  const retour = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: '/',
      params: { page: retourPage ?? '1', q: retourRecherche ?? '' },
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default FicheRoute;
