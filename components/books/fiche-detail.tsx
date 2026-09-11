import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { EtatErreur } from '@/components/etats-donnees';
import { libelleEditeur, type Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';
import { AvisEchecBascule, type AvisReessai } from './avis-echec-bascule';
import { ControleCoupDeCoeur } from './controle-coup-de-coeur';
import { ControleStatutLecture } from './controle-statut-lecture';

export type DetailFiche = {
  ouvrage: Ouvrage;
  corriger: () => void;
  basculerStatut: () => void;
  basculerCoupDeCoeur: () => void;
  basculeEnCours: boolean;
  erreurBascule?: AvisReessai;
  erreurActualisation?: { titre: string; message: string; reessayer: () => void };
  demanderSuppression: () => void;
  suppressionDesactivee: boolean;
};

const Renseignement = ({ libelle, valeur }: { libelle: string; valeur: string }) => (
  <View style={styles.renseignement}>
    <Text style={styles.libelle}>{libelle}</Text>
    <Text style={styles.valeur}>{valeur}</Text>
  </View>
);

export const FicheDetail = (detail: DetailFiche) => (
  <View style={styles.carte}>
    <Text accessibilityRole="header" style={styles.titre}>
      {detail.ouvrage.titre}
    </Text>
    <Renseignement libelle="Auteur" valeur={detail.ouvrage.auteur} />
    <Renseignement libelle="Éditeur" valeur={libelleEditeur(detail.ouvrage.editeur)} />
    <Renseignement libelle="Année de publication" valeur={String(detail.ouvrage.annee)} />
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
        libelleReessai="Réessayer l’actualisation de la fiche"
      />
    ) : null}
    <Pressable
      accessibilityLabel={`Supprimer ${detail.ouvrage.titre}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: detail.suppressionDesactivee }}
      disabled={detail.suppressionDesactivee}
      onPress={detail.demanderSuppression}
      style={[styles.boutonSuppression, detail.suppressionDesactivee && styles.boutonDesactive]}
    >
      <Text selectable={false} style={styles.texteBoutonSuppression}>
        {detail.suppressionDesactivee
          ? 'Suppression indisponible pendant l’envoi'
          : 'Supprimer cet ouvrage'}
      </Text>
    </Pressable>
    <Bouton action={detail.corriger} libelle="Corriger cet ouvrage" />
  </View>
);

const styles = StyleSheet.create({
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
