import { StyleSheet, Text, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

type OuvragesListProps = {
  ouvrages: Ouvrage[];
};

const StatutLecture = ({ lu }: Pick<Ouvrage, 'lu'>) => {
  const styleStatut = lu ? styles.statutLu : undefined;
  return (
    <View style={[styles.statut, styleStatut]}>
      <Text style={[styles.texteStatut, lu && styles.texteStatutLu]}>{lu ? 'Lu' : 'Non lu'}</Text>
    </View>
  );
};

export const OuvragesList = ({ ouvrages }: OuvragesListProps) => (
  <View accessibilityLabel="Ouvrages du fonds" role="list" style={styles.liste}>
    {ouvrages.map((ouvrage) => (
      <View key={ouvrage.id} role="listitem" style={styles.carte}>
        <View style={styles.description}>
          <Text accessibilityRole="header" style={styles.titre}>
            {ouvrage.titre}
          </Text>
          <Text style={styles.auteur}>{ouvrage.auteur}</Text>
          <Text style={styles.edition}>
            {ouvrage.editeur || 'Éditeur non renseigné'} · {ouvrage.annee}
          </Text>
        </View>
        <StatutLecture lu={ouvrage.lu} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  liste: {
    gap: theme.spacing.md,
  },
  carte: {
    minHeight: theme.layout.cardMinHeight,
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
  statut: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutralBackground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statutLu: {
    backgroundColor: theme.colors.successBackground,
  },
  texteStatut: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  texteStatutLu: {
    color: theme.colors.successText,
  },
});
