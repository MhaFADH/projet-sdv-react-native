import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type ChampNoteProps = {
  libelle: string;
  valeur: string;
  modifier: (valeur: string) => void;
  quitter: () => void;
  desactive: boolean;
  caracteresUtilises: number;
  caracteresMaximum: number;
  erreur?: string;
};

const NOMBRE_LIGNES = 4;
const IDENTIFIANT_ERREUR = 'erreur-note-lecture';
const IDENTIFIANT_COMPTEUR = 'compteur-note-lecture';

export const ChampNote = ({
  libelle,
  valeur,
  modifier,
  quitter,
  desactive,
  caracteresUtilises,
  caracteresMaximum,
  erreur,
}: ChampNoteProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const enErreur = erreur !== undefined;
  const depassement = caracteresUtilises > caracteresMaximum;
  const compteur = t('notes.compteur', {
    utilises: caracteresUtilises,
    maximum: caracteresMaximum,
  });

  return (
    <View style={styles.champ}>
      <Text style={styles.libelle}>{libelle}</Text>
      <TextInput
        accessibilityLabel={libelle}
        aria-describedby={
          enErreur ? `${IDENTIFIANT_COMPTEUR} ${IDENTIFIANT_ERREUR}` : IDENTIFIANT_COMPTEUR
        }
        aria-invalid={enErreur ? true : undefined}
        editable={!desactive}
        multiline
        numberOfLines={NOMBRE_LIGNES}
        onBlur={quitter}
        onChangeText={modifier}
        style={[
          styles.saisie,
          desactive && styles.saisieDesactivee,
          (enErreur || depassement) && styles.saisieErreur,
        ]}
        value={valeur}
      />
      <Text
        accessibilityLabel={t('notes.compteurUtilises', { compteur })}
        nativeID={IDENTIFIANT_COMPTEUR}
        role="status"
        style={[styles.compteur, depassement && styles.compteurDepasse]}
      >
        {compteur}
      </Text>
      {enErreur ? (
        <Text accessibilityRole="alert" nativeID={IDENTIFIANT_ERREUR} style={styles.erreur}>
          {erreur}
        </Text>
      ) : null}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    champ: { gap: theme.spacing.xs },
    libelle: {
      color: theme.colors.primary,
      fontSize: theme.typography.caption,
      fontWeight: '700',
      letterSpacing: theme.typography.overlineLetterSpacing,
      textTransform: 'uppercase',
    },
    saisie: {
      minHeight: theme.minTargetSize * 2,
      color: theme.colors.text,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
      textAlignVertical: 'top',
    },
    saisieDesactivee: {
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textMuted,
    },
    saisieErreur: { borderColor: theme.colors.dangerText },
    compteur: {
      alignSelf: 'flex-end',
      color: theme.colors.textMuted,
      fontSize: theme.typography.metadata,
    },
    compteurDepasse: { color: theme.colors.dangerText, fontWeight: '700' },
    erreur: {
      color: theme.colors.dangerText,
      fontSize: theme.typography.metadata,
      fontWeight: '600',
    },
  });
