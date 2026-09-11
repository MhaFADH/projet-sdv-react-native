import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type {
  ConsultationFonds,
  FiltreLecture,
  FiltreRecommandation,
  OrdreFonds,
  TriFonds,
} from '@/domain/criteres-ouvrages';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme, useTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import { creerActivationParEspace } from '@/services/plateforme/activation-clavier';
import type { Theme } from '@/theme/tokens';
import { type ChoixCritere, GroupeChoixFonds } from './groupe-choix-fonds';

type Traduire = ReturnType<typeof useTraduction>;

const LECTURES = ['tous', 'lu', 'nonlu'] as const satisfies readonly FiltreLecture[];
const RECOMMANDATIONS = ['toutes', 'favoris'] as const satisfies readonly FiltreRecommandation[];
const TRIS = ['titre', 'auteur', 'annee', 'note'] as const satisfies readonly TriFonds[];
const ORDRES = ['asc', 'desc'] as const satisfies readonly OrdreFonds[];

const LIBELLES_TRI = {
  titre: 'criteres.tri.titreOuvrage',
  auteur: 'criteres.tri.auteur',
  annee: 'criteres.tri.annee',
  note: 'criteres.tri.note',
} as const;

const choixLecture = (t: Traduire): readonly ChoixCritere<FiltreLecture>[] =>
  LECTURES.map((valeur) => ({ valeur, libelle: t(`criteres.lecture.${valeur}`) }));

const choixRecommandation = (t: Traduire): readonly ChoixCritere<FiltreRecommandation>[] =>
  RECOMMANDATIONS.map((valeur) => ({ valeur, libelle: t(`criteres.recommandation.${valeur}`) }));

const choixTri = (t: Traduire): readonly ChoixCritere<TriFonds>[] =>
  TRIS.map((valeur) => ({ valeur, libelle: t(LIBELLES_TRI[valeur]) }));

const choixOrdre = (t: Traduire): readonly ChoixCritere<OrdreFonds>[] =>
  ORDRES.map((valeur) => ({ valeur, libelle: t(`criteres.ordre.${valeur}`) }));

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
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const modifier = (modification: Partial<ConsultationFonds>) =>
    appliquer({ ...consultation, ...modification });

  return (
    <View
      accessibilityLabel={t('criteres.barre')}
      accessibilityRole="toolbar"
      style={[styles.conteneur, compact && styles.conteneurCompact]}
    >
      <View style={styles.zone}>
        <Text style={styles.titreZone}>{t('criteres.affiner')}</Text>
        <GroupeChoixFonds
          choix={choixLecture(t)}
          choisir={(lecture) => modifier({ lecture })}
          compact={compact}
          titre={t('criteres.lecture.titre')}
          valeur={consultation.lecture}
        />
        <GroupeChoixFonds
          choix={choixRecommandation(t)}
          choisir={(recommandation) => modifier({ recommandation })}
          compact={compact}
          titre={t('criteres.recommandation.titre')}
          valeur={consultation.recommandation}
        />
      </View>
      <View accessibilityLabel={t('criteres.optionsTri')} style={[styles.zone, styles.zoneSeparee]}>
        <Text style={styles.titreZone}>{t('criteres.trier')}</Text>
        <GroupeChoixFonds
          choix={choixTri(t)}
          choisir={(tri) => modifier({ tri })}
          compact={compact}
          titre={t('criteres.tri.titre')}
          valeur={consultation.tri}
        />
        <GroupeChoixFonds
          choix={choixOrdre(t)}
          choisir={(ordre) => modifier({ ordre })}
          compact={compact}
          titre={t('criteres.ordre.titre')}
          valeur={consultation.ordre}
        />
      </View>
    </View>
  );
};

export const FiltresTriFonds = ({ consultation, appliquer }: ProprietesFiltresTriFonds) => {
  const t = useTraduction();
  const { locale } = useFormats();
  const theme = useTheme();
  const styles = useStylesTheme(creerStyles);
  const { width } = useWindowDimensions();
  const compact = width < theme.layout.compactBreakpoint;
  const [ouvert, setOuvert] = useState(false);
  const basculer = () => setOuvert((valeur) => !valeur);
  const resume = `${libelleChoisi(choixLecture(t), consultation.lecture)}, ${libelleChoisi(
    choixRecommandation(t),
    consultation.recommandation,
  )}, ${libelleChoisi(choixTri(t), consultation.tri)} ${libelleChoisi(
    choixOrdre(t),
    consultation.ordre,
  ).toLocaleLowerCase(locale)}`;

  if (!compact) {
    return <ContenuCriteres appliquer={appliquer} compact={false} consultation={consultation} />;
  }

  return (
    <View style={styles.mobile}>
      <Pressable
        {...creerActivationParEspace(basculer)}
        accessibilityLabel={t('criteres.declencheurLibelle', { resume })}
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        aria-expanded={ouvert}
        onPress={basculer}
        style={styles.declencheur}
      >
        <View style={styles.resume}>
          <Text style={styles.texteDeclencheur}>{t('criteres.declencheur')}</Text>
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

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
