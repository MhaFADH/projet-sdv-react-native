import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { libelleStatutLecture, type Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

export type ErreurStatutLecture = {
  message: string;
  reessayer: () => void;
};

type ControleStatutLectureProps = {
  ouvrage: Ouvrage;
  basculerStatut: () => void;
  statutEnCours: boolean;
  erreurStatut?: ErreurStatutLecture;
};

export const ControleStatutLecture = ({
  ouvrage,
  basculerStatut,
  statutEnCours,
  erreurStatut,
}: ControleStatutLectureProps) => {
  const action = ouvrage.lu ? 'Marquer comme non lu' : 'Marquer comme lu';
  return (
    <View style={styles.renseignement}>
      <Text style={styles.libelle}>Statut de lecture collectif</Text>
      <Text style={styles.valeur}>{libelleStatutLecture(ouvrage.lu)}</Text>
      <Pressable
        accessibilityLabel={action}
        accessibilityRole="switch"
        accessibilityState={{ checked: ouvrage.lu, disabled: statutEnCours }}
        aria-checked={ouvrage.lu}
        aria-disabled={statutEnCours}
        disabled={statutEnCours}
        onPress={basculerStatut}
        style={[styles.boutonStatut, statutEnCours && styles.boutonDesactive]}
      >
        <Text
          selectable={false}
          style={[styles.texteBoutonStatut, statutEnCours && styles.texteMasque]}
        >
          {action}
        </Text>
        {statutEnCours ? (
          <ActivityIndicator
            accessibilityLabel="Enregistrement du statut en cours"
            color={theme.colors.primaryText}
            size="small"
            style={styles.indicateurStatut}
          />
        ) : null}
      </Pressable>
      {erreurStatut ? (
        <View accessibilityRole="alert" style={styles.erreurStatut}>
          <Text style={styles.texteErreur}>{erreurStatut.message}</Text>
          <Pressable
            accessibilityLabel="Réessayer la modification du statut"
            accessibilityRole="button"
            onPress={erreurStatut.reessayer}
            style={styles.boutonReessai}
          >
            <Text selectable={false} style={styles.texteBoutonReessai}>
              Réessayer
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  renseignement: { gap: theme.spacing.xs },
  libelle: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
    letterSpacing: theme.typography.overlineLetterSpacing,
    textTransform: 'uppercase',
  },
  valeur: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  boutonStatut: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  boutonDesactive: { opacity: 0.65 },
  texteBoutonStatut: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  texteMasque: { opacity: 0 },
  indicateurStatut: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  erreurStatut: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerBackground,
  },
  texteErreur: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  boutonReessai: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.dangerText,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  texteBoutonReessai: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
