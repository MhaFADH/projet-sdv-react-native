import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useStylesTheme, useTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import { creerActivationParEspace } from '@/services/plateforme/activation-clavier';
import type { Theme } from '@/theme/tokens';

type BoutonCoupDeCoeurProps = {
  favori: boolean;
  basculer: () => void;
  enCours: boolean;
  titre?: string;
};

export const BoutonCoupDeCoeur = ({ favori, basculer, enCours, titre }: BoutonCoupDeCoeurProps) => {
  const t = useTraduction();
  const theme = useTheme();
  const styles = useStylesTheme(creerStyles);
  const action = t(favori ? 'ouvrage.coupDeCoeurRetirer' : 'ouvrage.coupDeCoeurAjouter');
  const activer = () => {
    if (!enCours) basculer();
  };

  return (
    <Pressable
      {...creerActivationParEspace(activer)}
      accessibilityLabel={
        titre === undefined ? action : t('ouvrage.coupDeCoeurCible', { action, titre })
      }
      accessibilityRole="switch"
      accessibilityState={{ checked: favori, disabled: enCours }}
      aria-checked={favori}
      aria-disabled={enCours}
      disabled={enCours}
      onPress={activer}
      style={[styles.bouton, favori && styles.boutonActif, enCours && styles.boutonEnCours]}
    >
      <Text selectable={false} style={[styles.coeur, favori && styles.coeurActif]}>
        {favori ? '♥' : '♡'}
      </Text>
      {enCours ? (
        <ActivityIndicator
          accessibilityLabel={t('ouvrage.coupDeCoeurEnCours')}
          color={theme.colors.favoriText}
          size="small"
          style={styles.indicateur}
        />
      ) : null}
    </Pressable>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    bouton: {
      width: theme.minTargetSize,
      minWidth: theme.minTargetSize,
      minHeight: theme.minTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
    },
    boutonActif: {
      borderColor: theme.colors.favoriText,
      backgroundColor: theme.colors.favoriBackground,
    },
    boutonEnCours: {
      opacity: 0.65,
    },
    coeur: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    coeurActif: {
      color: theme.colors.favoriText,
    },
    indicateur: {
      position: 'absolute',
      right: 0,
      bottom: 0,
    },
  });
