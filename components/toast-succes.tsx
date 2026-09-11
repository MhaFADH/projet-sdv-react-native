import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

export type ActionToast = {
  libelle: string;
  executer: () => void;
};

type ToastSuccesProps = {
  message: string;
  suspendre: () => void;
  reprendre: () => void;
  action?: ActionToast;
};

export const ToastSucces = ({ message, suspendre, reprendre, action }: ToastSuccesProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <Pressable
      onHoverIn={suspendre}
      onHoverOut={reprendre}
      role="status"
      style={styles.toast}
      testID="toast-succes"
    >
      <View style={styles.contenu}>
        <Text style={styles.message}>{message}</Text>
        {action === undefined ? null : (
          <Bouton
            action={action.executer}
            libelle={action.libelle}
            onBlur={reprendre}
            onFocus={suspendre}
            variante="secondaire"
          />
        )}
      </View>
    </Pressable>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
