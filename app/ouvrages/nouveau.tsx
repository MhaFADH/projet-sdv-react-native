import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormulaireOuvrageScreen } from '@/features/books/formulaire-ouvrage-screen';
import { theme } from '@/theme/tokens';

const NouvelOuvrageRoute = () => {
  const router = useRouter();
  const retourAuFonds = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <FormulaireOuvrageScreen
        ouvrirOuvrage={(id: string) => router.push({ pathname: '/ouvrages/[id]', params: { id } })}
        retourAuFonds={retourAuFonds}
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

export default NouvelOuvrageRoute;
