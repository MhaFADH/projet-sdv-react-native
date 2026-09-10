import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FicheScreen } from '@/features/books/fiche-screen';
import { theme } from '@/theme/tokens';

const FicheRoute = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const retour = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <FicheScreen id={id ?? ''} retour={retour} />
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
