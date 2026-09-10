import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type {
  ConsultationFonds,
  FiltreLecture,
  FiltreRecommandation,
  OrdreFonds,
  TriFonds,
} from '@/domain/criteres-ouvrages';
import { creerActivationParEspace } from '@/services/plateforme/activation-clavier';
import { theme } from '@/theme/tokens';
import { type ChoixCritere, GroupeChoixFonds } from './groupe-choix-fonds';

const LECTURES: readonly ChoixCritere<FiltreLecture>[] = [
  { valeur: 'tous', libelle: 'Tous les statuts' },
  { valeur: 'lu', libelle: 'Lus' },
  { valeur: 'nonlu', libelle: 'Non lus' },
];

const RECOMMANDATIONS: readonly ChoixCritere<FiltreRecommandation>[] = [
  { valeur: 'toutes', libelle: 'Toutes les recommandations' },
  { valeur: 'favoris', libelle: 'Coups de cœur' },
];

const TRIS: readonly ChoixCritere<TriFonds>[] = [
  { valeur: 'titre', libelle: 'Titre' },
  { valeur: 'auteur', libelle: 'Auteur' },
  { valeur: 'annee', libelle: 'Année' },
  { valeur: 'note', libelle: 'Notation' },
];

const ORDRES: readonly ChoixCritere<OrdreFonds>[] = [
  { valeur: 'asc', libelle: 'Croissant' },
  { valeur: 'desc', libelle: 'Décroissant' },
];

const libelleChoisi = <Valeur extends string>(
  choix: readonly ChoixCritere<Valeur>[],
  valeur: Valeur,
): string => choix.find((option) => option.valeur === valeur)?.libelle ?? valeur;

type ProprietesFiltresTriFonds = {
  consultation: ConsultationFonds;
  appliquer: (consultation: ConsultationFonds) => void;
};

const ContenuCriteres = ({
  consultation,
  appliquer,
  compact,
}: ProprietesFiltresTriFonds & { compact: boolean }) => {
  const modifier = (modification: Partial<ConsultationFonds>) =>
    appliquer({ ...consultation, ...modification });

  return (
    <View
      accessibilityLabel="Critères du fonds"
      accessibilityRole="toolbar"
      style={[styles.conteneur, compact && styles.conteneurCompact]}
    >
      <View style={styles.zone}>
        <Text style={styles.titreZone}>Affiner</Text>
        <GroupeChoixFonds
          choix={LECTURES}
          choisir={(lecture) => modifier({ lecture })}
          compact={compact}
          titre="Filtre de lecture"
          valeur={consultation.lecture}
        />
        <GroupeChoixFonds
          choix={RECOMMANDATIONS}
          choisir={(recommandation) => modifier({ recommandation })}
          compact={compact}
          titre="Recommandations"
          valeur={consultation.recommandation}
        />
      </View>
      <View accessibilityLabel="Options de tri" style={[styles.zone, styles.zoneSeparee]}>
        <Text style={styles.titreZone}>Trier</Text>
        <GroupeChoixFonds
          choix={TRIS}
          choisir={(tri) => modifier({ tri })}
          compact={compact}
          titre="Trier par"
          valeur={consultation.tri}
        />
        <GroupeChoixFonds
          choix={ORDRES}
          choisir={(ordre) => modifier({ ordre })}
          compact={compact}
          titre="Ordre"
          valeur={consultation.ordre}
        />
      </View>
    </View>
  );
};

export const FiltresTriFonds = ({ consultation, appliquer }: ProprietesFiltresTriFonds) => {
  const { width } = useWindowDimensions();
  const compact = width < theme.layout.compactBreakpoint;
  const [ouvert, setOuvert] = useState(false);
  const basculer = () => setOuvert((valeur) => !valeur);
  const resume = `${libelleChoisi(LECTURES, consultation.lecture)}, ${libelleChoisi(
    RECOMMANDATIONS,
    consultation.recommandation,
  )}, ${libelleChoisi(TRIS, consultation.tri)} ${libelleChoisi(
    ORDRES,
    consultation.ordre,
  ).toLocaleLowerCase('fr')}`;

  if (!compact) {
    return <ContenuCriteres appliquer={appliquer} compact={false} consultation={consultation} />;
  }

  return (
    <View style={styles.mobile}>
      <Pressable
        {...creerActivationParEspace(basculer)}
        accessibilityLabel={`Filtres et tri. ${resume}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        aria-expanded={ouvert}
        onPress={basculer}
        style={styles.declencheur}
      >
        <View style={styles.resume}>
          <Text style={styles.texteDeclencheur}>Filtres et tri</Text>
          <Text numberOfLines={1} style={styles.texteResume}>
            {resume}
          </Text>
        </View>
        <Text style={styles.chevron}>{ouvert ? '−' : '+'}</Text>
      </Pressable>
      {ouvert ? (
        <ContenuCriteres appliquer={appliquer} compact consultation={consultation} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  conteneurCompact: {
    flexDirection: 'column',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  zone: {
    width: '100%',
    minWidth: 0,
    gap: theme.spacing.sm,
  },
  zoneSeparee: {
    paddingTop: theme.spacing.md,
    borderTopWidth: theme.borderWidth,
    borderTopColor: theme.colors.border,
  },
  titreZone: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '700',
    letterSpacing: theme.typography.overlineLetterSpacing,
    textTransform: 'uppercase',
  },
  mobile: { width: '100%' },
  declencheur: {
    minHeight: theme.minTargetSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  resume: { flex: 1, gap: theme.spacing.xs },
  texteDeclencheur: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  texteResume: { color: theme.colors.textMuted, fontSize: theme.typography.caption },
  chevron: { color: theme.colors.primary, fontSize: theme.typography.sectionTitle },
});
