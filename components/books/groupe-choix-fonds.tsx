import { useRef } from 'react';
import type { View as VueNative } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { creerNavigationGroupeRadio } from '@/services/plateforme/activation-clavier';
import { theme } from '@/theme/tokens';

export type ChoixCritere<Valeur extends string> = {
  valeur: Valeur;
  libelle: string;
};

type ProprietesGroupeChoixFonds<Valeur extends string> = {
  titre: string;
  choix: readonly ChoixCritere<Valeur>[];
  valeur: Valeur;
  choisir: (valeur: Valeur) => void;
  compact: boolean;
};

export const GroupeChoixFonds = <Valeur extends string>({
  titre,
  choix,
  valeur,
  choisir,
  compact,
}: ProprietesGroupeChoixFonds<Valeur>) => {
  const references = useRef<Array<VueNative | null>>([]);
  const choisirIndex = (index: number) => {
    const indexNormalise = (index + choix.length) % choix.length;
    const option = choix[indexNormalise];
    choisir(option.valeur);
    references.current[indexNormalise]?.focus();
  };

  return (
    <View
      accessibilityLabel={titre}
      accessibilityRole="radiogroup"
      style={[styles.groupe, compact && styles.groupeCompact]}
    >
      <Text numberOfLines={1} style={[styles.titre, compact && styles.titreCompact]}>
        {titre}
      </Text>
      <View style={styles.choix}>
        {choix.map((option, index) => {
          const selectionne = option.valeur === valeur;
          const selectionner = () => choisir(option.valeur);
          return (
            <Pressable
              {...creerNavigationGroupeRadio({
                activer: selectionner,
                precedent: () => choisirIndex(index - 1),
                suivant: () => choisirIndex(index + 1),
                premier: () => choisirIndex(0),
                dernier: () => choisirIndex(choix.length - 1),
              })}
              accessibilityLabel={option.libelle}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectionne, selected: selectionne }}
              aria-checked={selectionne}
              key={option.valeur}
              onPress={selectionner}
              ref={(element) => {
                references.current[index] = element;
              }}
              style={[styles.bouton, selectionne && styles.boutonSelectionne]}
              tabIndex={selectionne ? 0 : -1}
            >
              <Text style={[styles.libelle, selectionne && styles.libelleSelectionne]}>
                {option.libelle}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  groupe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  groupeCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titre: {
    width: theme.layout.criteriaLabelWidth,
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  titreCompact: { width: 'auto' },
  choix: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    minWidth: theme.minTargetSize,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  boutonSelectionne: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  libelle: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  libelleSelectionne: { color: theme.colors.primaryText },
});
