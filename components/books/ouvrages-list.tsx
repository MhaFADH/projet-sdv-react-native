import { Pressable, StyleSheet, Text, View } from 'react-native';
import { libelleEdition, libelleStatutLecture, type Ouvrage } from '@/domain/ouvrage';
import { creerActivationParEspace } from '@/services/plateforme/activation-clavier';
import { theme } from '@/theme/tokens';
import { StatutLecture } from './statut-lecture';

type OuvragesListProps = {
  ouvrages: Ouvrage[];
  identifiantsSelectionnes: ReadonlySet<string>;
  basculerSelection: (id: string) => void;
  ouvrirOuvrage: (id: string) => void;
};

export const OuvragesList = ({
  ouvrages,
  identifiantsSelectionnes,
  basculerSelection,
  ouvrirOuvrage,
}: OuvragesListProps) => (
  <View accessibilityLabel="Ouvrages du fonds" role="list" style={styles.liste}>
    {ouvrages.map((ouvrage) => {
      const selectionne = identifiantsSelectionnes.has(ouvrage.id);
      const basculer = () => basculerSelection(ouvrage.id);
      return (
        <View key={ouvrage.id} role="listitem" style={styles.ligne}>
          <Pressable
            {...creerActivationParEspace(basculer)}
            accessibilityLabel={`Sélectionner ${ouvrage.titre}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selectionne }}
            aria-checked={selectionne}
            onPress={basculer}
            style={[styles.caseSelection, selectionne && styles.caseSelectionnee]}
          >
            <Text selectable={false} style={styles.coche}>
              {selectionne ? '✓' : ''}
            </Text>
          </Pressable>
          <Pressable
            accessibilityHint="Ouvre la fiche de l’ouvrage"
            accessibilityLabel={`${ouvrage.titre}, ${ouvrage.auteur}, ${libelleStatutLecture(ouvrage.lu)}`}
            accessibilityRole="button"
            onPress={() => ouvrirOuvrage(ouvrage.id)}
            style={styles.carte}
          >
            <View style={styles.description}>
              <Text style={styles.titre}>{ouvrage.titre}</Text>
              <Text style={styles.auteur}>{ouvrage.auteur}</Text>
              <Text style={styles.edition}>{libelleEdition(ouvrage)}</Text>
            </View>
            <StatutLecture lu={ouvrage.lu} />
          </Pressable>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  liste: {
    gap: theme.spacing.md,
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
