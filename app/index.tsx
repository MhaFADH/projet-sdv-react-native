import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FondsScreen } from '@/features/books/fonds-screen';
import { theme } from '@/theme/tokens';

const FondsRoute = () => (
  <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
    <FondsScreen />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default FondsRoute;
