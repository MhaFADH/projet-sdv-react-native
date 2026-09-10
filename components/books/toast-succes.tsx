import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { theme } from '@/theme/tokens';

type ToastSuccesProps = {
  message: string;
  ouvrirFiche: () => void;
  suspendre: () => void;
  reprendre: () => void;
};

export const ToastSucces = ({ message, ouvrirFiche, suspendre, reprendre }: ToastSuccesProps) => (
  <Pressable
    onHoverIn={suspendre}
    onHoverOut={reprendre}
    role="status"
    style={styles.toast}
    testID="toast-succes"
  >
    <View style={styles.contenu}>
      <Text style={styles.message}>{message}</Text>
      <Bouton
        action={ouvrirFiche}
        libelle="Ouvrir la fiche"
        onBlur={reprendre}
        onFocus={suspendre}
        variante="secondaire"
      />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  toast: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.successText,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.successBackground,
    padding: theme.spacing.md,
  },
  contenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  message: {
    flexGrow: 1,
    flexShrink: 1,
    color: theme.colors.successText,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
});
