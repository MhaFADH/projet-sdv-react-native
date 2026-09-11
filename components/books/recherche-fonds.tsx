import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStylesTheme, useTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import { configuration } from '@/services/configuration';
import type { Theme } from '@/theme/tokens';

const DELAI_RECHERCHE_MS = configuration.delaiRechercheMs;

type ProprietesRechercheFonds = {
  valeurAppliquee: string;
  appliquer: (recherche: string) => void;
};

export const RechercheFonds = ({ valeurAppliquee, appliquer }: ProprietesRechercheFonds) => {
  const t = useTraduction();
  const theme = useTheme();
  const styles = useStylesTheme(creerStyles);
  const libelleRecherche = t('recherche.libelle');
  const [saisie, setSaisie] = useState(valeurAppliquee);

  useEffect(() => setSaisie(valeurAppliquee), [valeurAppliquee]);

  useEffect(() => {
    if (saisie === valeurAppliquee) return;
    const attente = setTimeout(() => appliquer(saisie), DELAI_RECHERCHE_MS);
    return () => clearTimeout(attente);
  }, [appliquer, saisie, valeurAppliquee]);

  return (
    <View accessibilityRole="search" style={styles.conteneur}>
      <TextInput
        accessibilityLabel={libelleRecherche}
        onChangeText={setSaisie}
        placeholder={libelleRecherche}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.champ}
        value={saisie}
      />
      {saisie !== '' ? (
        <Pressable
          accessibilityLabel={t('recherche.effacerLibelle')}
          accessibilityRole="button"
          onPress={() => setSaisie('')}
          style={styles.effacer}
        >
          <Text style={styles.texteEffacer}>{t('recherche.effacer')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    conteneur: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    champ: {
      minWidth: theme.layout.cardTextMinWidth,
      minHeight: theme.minTargetSize,
      flexGrow: 1,
      flexShrink: 1,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: theme.typography.body,
      paddingHorizontal: theme.spacing.md,
    },
    effacer: {
      minHeight: theme.minTargetSize,
      minWidth: theme.minTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
    },
    texteEffacer: {
      color: theme.colors.primary,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
  });
