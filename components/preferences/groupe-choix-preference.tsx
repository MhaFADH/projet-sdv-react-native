import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type View as VueNative } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import { creerNavigationGroupeRadio } from '@/services/plateforme/activation-clavier';
import type { Theme } from '@/theme/tokens';

export type ChoixPreference<Valeur extends string> = {
  valeur: Valeur;
  libelle: string;
};

type ProprietesGroupeChoixPreference<Valeur extends string> = {
  titre: string;
  description: string;
  choix: readonly ChoixPreference<Valeur>[];
  valeur: Valeur;
  choisir: (valeur: Valeur) => void;
};

export const GroupeChoixPreference = <Valeur extends string>({
  titre,
  description,
  choix,
  valeur,
  choisir,
}: ProprietesGroupeChoixPreference<Valeur>) => {
  const styles = useStylesTheme(creerStyles);
  const [valeurFocalisee, setValeurFocalisee] = useState<Valeur | null>(null);
  const references = useRef<Array<VueNative | null>>([]);
  const choisirIndex = (index: number) => {
    const indexNormalise = (index + choix.length) % choix.length;
    choisir(choix[indexNormalise].valeur);
    references.current[indexNormalise]?.focus();
  };

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.titre}>
        {titre}
      </Text>
      <Text style={styles.description}>{description}</Text>
      <View accessibilityLabel={titre} accessibilityRole="radiogroup" style={styles.choix}>
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
              onBlur={() => setValeurFocalisee(null)}
              onFocus={() => setValeurFocalisee(option.valeur)}
              onPress={selectionner}
              ref={(element) => {
                references.current[index] = element;
              }}
              style={[
                styles.option,
                selectionne && styles.optionSelectionnee,
                option.valeur === valeurFocalisee && styles.optionFocalisee,
              ]}
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

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    description: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption,
      lineHeight: theme.typography.bodyLineHeight,
    },
    choix: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    option: {
      minHeight: theme.minTargetSize,
      minWidth: theme.minTargetSize,
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background,
    },
    optionSelectionnee: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    optionFocalisee: {
      borderColor: theme.colors.focus,
    },
    libelle: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
    libelleSelectionne: { color: theme.colors.primaryText },
  });
