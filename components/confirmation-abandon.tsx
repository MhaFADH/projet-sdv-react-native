import { StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type ConfirmationAbandonProps = {
  confirmer: () => void;
  poursuivre: () => void;
};

export const ConfirmationAbandon = ({ confirmer, poursuivre }: ConfirmationAbandonProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <View accessibilityRole="alert" style={styles.cadre}>
      <Text accessibilityRole="header" style={styles.titre}>
        {t('abandon.titre')}
      </Text>
      <Text style={styles.message}>{t('abandon.message')}</Text>
      <View style={styles.actions}>
        <Bouton action={poursuivre} libelle={t('abandon.poursuivre')} />
        <Bouton action={confirmer} libelle={t('abandon.abandonner')} variante="secondaire" />
      </View>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    cadre: {
      gap: theme.spacing.sm,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    message: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
    },
  });
