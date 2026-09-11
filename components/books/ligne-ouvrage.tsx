import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import { creerActivationParEspace } from '@/services/plateforme/activation-clavier';
import type { Theme } from '@/theme/tokens';
import { AvisEchecBascule, type AvisReessai } from './avis-echec-bascule';
import { BoutonCoupDeCoeur } from './bouton-coup-de-coeur';
import { StatutLecture } from './statut-lecture';

export type LigneOuvrageProps = {
  ouvrage: Ouvrage;
  selectionne: boolean;
  basculerSelection: () => void;
  ouvrirOuvrage: () => void;
  ouvertureDesactivee: boolean;
  selectionDesactivee: boolean;
  basculerCoupDeCoeur: () => void;
  basculeEnCours: boolean;
  erreurBascule?: AvisReessai;
};

export const LigneOuvrage = ({
  ouvrage,
  selectionne,
  basculerSelection,
  ouvrirOuvrage,
  ouvertureDesactivee,
  selectionDesactivee,
  basculerCoupDeCoeur,
  basculeEnCours,
  erreurBascule,
}: LigneOuvrageProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const statut = t(ouvrage.lu ? 'ouvrage.lu' : 'ouvrage.nonLu');
  const editeur =
    ouvrage.editeur.trim() === '' ? t('ouvrage.editeurNonRenseigne') : ouvrage.editeur;

  return (
    <View role="listitem" style={styles.element}>
      <View style={styles.ligne}>
        <Pressable
          {...creerActivationParEspace(basculerSelection)}
          accessibilityLabel={t('ouvrage.selectionner', { titre: ouvrage.titre })}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selectionne, disabled: selectionDesactivee }}
          aria-checked={selectionne}
          disabled={selectionDesactivee}
          onPress={basculerSelection}
          style={[
            styles.caseSelection,
            selectionne && styles.caseSelectionnee,
            selectionDesactivee && styles.caseSelectionDesactivee,
          ]}
        >
          <Text selectable={false} style={styles.coche}>
            {selectionne ? '✓' : ''}
          </Text>
        </Pressable>
        <Pressable
          accessibilityHint={t(
            ouvertureDesactivee ? 'ouvrage.ouvertureIndisponible' : 'ouvrage.ouvrir',
          )}
          accessibilityLabel={t('ouvrage.resume', {
            titre: ouvrage.titre,
            auteur: ouvrage.auteur,
            statut,
          })}
          accessibilityRole="button"
          accessibilityState={{ disabled: ouvertureDesactivee }}
          disabled={ouvertureDesactivee}
          onPress={ouvrirOuvrage}
          style={[styles.carte, ouvertureDesactivee && styles.carteDesactivee]}
        >
          <View style={styles.description}>
            <Text style={styles.titre}>{ouvrage.titre}</Text>
            <Text style={styles.auteur}>{ouvrage.auteur}</Text>
            <Text style={styles.edition}>
              {t('ouvrage.edition', { editeur, annee: ouvrage.annee })}
            </Text>
          </View>
          <StatutLecture lu={ouvrage.lu} />
        </Pressable>
        <BoutonCoupDeCoeur
          basculer={basculerCoupDeCoeur}
          enCours={basculeEnCours}
          favori={ouvrage.favori}
          titre={ouvrage.titre}
        />
      </View>
      {erreurBascule ? (
        <AvisEchecBascule
          libelleReessai={`${erreurBascule.libelleReessai} : ${ouvrage.titre}`}
          message={erreurBascule.message}
          reessayer={erreurBascule.reessayer}
        />
      ) : null}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    element: {
      gap: theme.spacing.sm,
    },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    caseSelection: {
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
    caseSelectionnee: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    caseSelectionDesactivee: {
      opacity: 0.5,
    },
    coche: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    carte: {
      minHeight: theme.layout.cardMinHeight,
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
    },
    carteDesactivee: {
      opacity: 0.5,
    },
    description: {
      flexGrow: 1,
      flexShrink: 1,
      minWidth: theme.layout.cardTextMinWidth,
      gap: theme.spacing.xs,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    auteur: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
    edition: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.metadata,
    },
  });
