import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { libelleStatutLecture } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

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

const MENTION_FACULTATIF = ' (facultatif)';

type EtatAccessibleChamp = {
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

/**
 * React Native ne type pas encore ces attributs, que react-native-web
 * transmet au DOM : ils portent l'état d'erreur du champ sur la cible web.
 */
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
  const libelleAccessible = `${libelle}${facultatif ? MENTION_FACULTATIF : ''}`;
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

export const BasculeStatut = ({ lu, modifier, desactive }: BasculeStatutProps) => (
  <View style={styles.champ}>
    <Text style={styles.libelle}>Statut de lecture</Text>
    <Pressable
      accessibilityLabel="Statut de lecture"
      accessibilityRole="switch"
      accessibilityState={{ checked: lu, disabled: desactive }}
      accessibilityValue={{ text: libelleStatutLecture(lu) }}
      disabled={desactive}
      onPress={() => modifier(!lu)}
      style={[styles.bascule, lu && styles.basculeActive, desactive && styles.basculeDesactivee]}
    >
      <Text style={[styles.texteBascule, lu && styles.texteBasculeActive]}>
        {libelleStatutLecture(lu)}
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
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
