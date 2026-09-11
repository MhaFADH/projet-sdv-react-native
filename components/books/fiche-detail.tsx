import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { EtatErreur } from '@/components/etats-donnees';
import type { ValeurNotation } from '@/domain/notation-ouvrage';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { CouvertureResolue } from '@/services/couvertures';
import type { Theme } from '@/theme/tokens';
import { AvisEchecBascule, type AvisReessai } from './avis-echec-bascule';
import { ControleCoupDeCoeur } from './controle-coup-de-coeur';
import { ControleNotation } from './controle-notation';
import { ControleStatutLecture } from './controle-statut-lecture';
import { CouvertureOuvrage } from './couverture-ouvrage';

export type DetailFiche = {
  ouvrage: Ouvrage;
  couverture: CouvertureResolue;
  corriger: () => void;
  basculerStatut: () => void;
  basculerCoupDeCoeur: () => void;
  noter: (valeur: ValeurNotation) => void;
  basculeEnCours: boolean;
  erreurBascule?: AvisReessai;
  erreurActualisation?: { titre: string; message: string; reessayer: () => void };
  demanderSuppression: () => void;
  suppressionDesactivee: boolean;
};

const Renseignement = ({ libelle, valeur }: { libelle: string; valeur: string }) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={styles.renseignement}>
      <Text style={styles.libelle}>{libelle}</Text>
      <Text style={styles.valeur}>{valeur}</Text>
    </View>
  );
};

export const FicheDetail = (detail: DetailFiche) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const editeur =
    detail.ouvrage.editeur.trim() === ''
      ? t('ouvrage.editeurNonRenseigne')
      : detail.ouvrage.editeur;

  return (
    <View style={styles.carte}>
      <CouvertureOuvrage couverture={detail.couverture} titre={detail.ouvrage.titre} />
      <Text accessibilityRole="header" style={styles.titre}>
        {detail.ouvrage.titre}
      </Text>
      <Renseignement libelle={t('fiche.auteur')} valeur={detail.ouvrage.auteur} />
      <Renseignement libelle={t('fiche.editeur')} valeur={editeur} />
      <Renseignement libelle={t('fiche.annee')} valeur={String(detail.ouvrage.annee)} />
      <ControleNotation
        modificationEnCours={detail.basculeEnCours}
        noter={detail.noter}
        ouvrage={detail.ouvrage}
      />
      <ControleCoupDeCoeur
        basculeEnCours={detail.basculeEnCours}
        basculerCoupDeCoeur={detail.basculerCoupDeCoeur}
        ouvrage={detail.ouvrage}
      />
      <ControleStatutLecture
        basculeEnCours={detail.basculeEnCours}
        basculerStatut={detail.basculerStatut}
        ouvrage={detail.ouvrage}
      />
      {detail.erreurBascule ? <AvisEchecBascule {...detail.erreurBascule} /> : null}
      {detail.erreurActualisation ? (
        <EtatErreur
          {...detail.erreurActualisation}
          libelleReessai={t('fiche.reessaiActualisation')}
        />
      ) : null}
      <Pressable
        accessibilityLabel={t('fiche.supprimerCible', { titre: detail.ouvrage.titre })}
        accessibilityRole="button"
        accessibilityState={{ disabled: detail.suppressionDesactivee }}
        disabled={detail.suppressionDesactivee}
        onPress={detail.demanderSuppression}
        style={[styles.boutonSuppression, detail.suppressionDesactivee && styles.boutonDesactive]}
      >
        <Text selectable={false} style={styles.texteBoutonSuppression}>
          {t(detail.suppressionDesactivee ? 'fiche.supprimerIndisponible' : 'fiche.supprimer')}
        </Text>
      </Pressable>
      <Bouton action={detail.corriger} libelle={t('fiche.corriger')} />
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    carte: {
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.pageTitle,
      fontWeight: '700',
    },
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
    boutonSuppression: {
      minHeight: theme.minTargetSize,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.dangerText,
    },
    boutonDesactive: { opacity: 0.5 },
    texteBoutonSuppression: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
  });
