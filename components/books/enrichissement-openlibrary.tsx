import { StyleSheet, Text, View } from 'react-native';
import type { EnrichissementBibliographique as DonneesEnrichissement } from '@/domain/enrichissement-bibliographique';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

export const EnrichissementOpenLibrary = (donnees: DonneesEnrichissement) => {
  const t = useTraduction();
  const { nombre } = useFormats();
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={styles.conteneur}>
      <Text accessibilityRole="header" style={styles.titre}>
        {t('fiche.openLibraryTitre')}
      </Text>
      <Text style={styles.texte}>
        {t('fiche.editionsReferencees', {
          count: donnees.nombreEditions,
          nombre: nombre(donnees.nombreEditions),
        })}
      </Text>
      {donnees.premiereAnnee === undefined ? null : (
        <Text style={styles.texte}>
          {t('fiche.premierePublication', { annee: nombre(donnees.premiereAnnee) })}
        </Text>
      )}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    conteneur: {
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surfaceMuted,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    texte: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
    },
  });
