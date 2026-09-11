import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type ChampTexteProps = {
  libelle: string;
  valeur: string;
  modifier: (valeur: string) => void;
  quitter: () => void;
  desactive: boolean;
  erreur?: string;
  facultatif?: boolean;
  numerique?: boolean;
};

type BasculeStatutProps = {
  lu: boolean;
  modifier: (lu: boolean) => void;
  desactive: boolean;
};

type EtatAccessibleChamp = {
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

const etatAccessibleChamp = (identifiantErreur: string, enErreur: boolean): EtatAccessibleChamp =>
  enErreur ? { 'aria-invalid': true, 'aria-describedby': identifiantErreur } : {};

export const ChampTexte = ({
  libelle,
  valeur,
  modifier,
  quitter,
  desactive,
  erreur,
  facultatif = false,
  numerique = false,
}: ChampTexteProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const libelleAccessible = facultatif ? t('formulaire.facultatif', { libelle }) : libelle;
  const identifiantErreur = `erreur-${libelle}`;

  return (
    <View style={styles.champ}>
      <Text style={styles.libelle}>{libelleAccessible}</Text>
      <TextInput
        {...etatAccessibleChamp(identifiantErreur, erreur !== undefined)}
        accessibilityLabel={libelleAccessible}
        editable={!desactive}
        inputMode={numerique ? 'numeric' : 'text'}
        onBlur={quitter}
        onChangeText={modifier}
        style={[styles.saisie, desactive && styles.saisieDesactivee, erreur && styles.saisieErreur]}
        value={valeur}
      />
      {erreur === undefined ? null : (
        <Text accessibilityRole="alert" nativeID={identifiantErreur} style={styles.erreur}>
          {erreur}
        </Text>
      )}
    </View>
  );
};

export const BasculeStatut = ({ lu, modifier, desactive }: BasculeStatutProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const statut = t(lu ? 'ouvrage.lu' : 'ouvrage.nonLu');

  return (
    <View style={styles.champ}>
      <Text style={styles.libelle}>{t('formulaire.statutLecture')}</Text>
      <Pressable
        accessibilityLabel={t('formulaire.statutLecture')}
        accessibilityRole="switch"
        accessibilityState={{ checked: lu, disabled: desactive }}
        aria-checked={lu}
        accessibilityValue={{ text: statut }}
        disabled={desactive}
        onPress={() => modifier(!lu)}
        style={[styles.bascule, lu && styles.basculeActive, desactive && styles.basculeDesactivee]}
      >
        <Text style={[styles.texteBascule, lu && styles.texteBasculeActive]}>{statut}</Text>
      </Pressable>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    champ: {
      gap: theme.spacing.xs,
    },
    libelle: {
      color: theme.colors.primary,
      fontSize: theme.typography.caption,
      fontWeight: '700',
      letterSpacing: theme.typography.overlineLetterSpacing,
      textTransform: 'uppercase',
    },
    saisie: {
      minHeight: theme.minTargetSize,
      color: theme.colors.text,
      fontSize: theme.typography.body,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
    },
    saisieDesactivee: {
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textMuted,
    },
    saisieErreur: {
      borderColor: theme.colors.dangerText,
    },
    erreur: {
      color: theme.colors.dangerText,
      fontSize: theme.typography.metadata,
      fontWeight: '600',
    },
    bascule: {
      minHeight: theme.minTargetSize,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.neutralBackground,
      paddingHorizontal: theme.spacing.md,
    },
    basculeActive: {
      backgroundColor: theme.colors.successBackground,
    },
    basculeDesactivee: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    texteBascule: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    texteBasculeActive: {
      color: theme.colors.successText,
    },
  });
