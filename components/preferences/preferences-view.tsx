import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  LANGUES,
  type Langue,
  PREFERENCES_THEME,
  type PreferenceTheme,
} from '@/domain/preferences';
import { useFocusVisible } from '@/hooks/use-focus-visible';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import { type ChoixPreference, GroupeChoixPreference } from './groupe-choix-preference';

const LIBELLES_THEME = {
  systeme: 'preferences.theme.systeme',
  clair: 'preferences.theme.clair',
  sombre: 'preferences.theme.sombre',
} as const satisfies Record<PreferenceTheme, string>;

const LIBELLES_LANGUE = {
  fr: 'preferences.langue.fr',
  en: 'preferences.langue.en',
} as const satisfies Record<Langue, string>;

export type PreferencesViewProps = {
  preferenceTheme: PreferenceTheme;
  langue: Langue;
  stockageEchoue: boolean;
  choisirTheme: (preference: PreferenceTheme) => void;
  choisirLangue: (langue: Langue) => void;
  reessayerStockage: () => void;
  revenir: () => void;
};

export const PreferencesView = ({
  preferenceTheme,
  langue,
  stockageEchoue,
  choisirTheme,
  choisirLangue,
  reessayerStockage,
  revenir,
}: PreferencesViewProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const focusRetour = useFocusVisible();
  const focusReessai = useFocusVisible();
  const choixTheme: readonly ChoixPreference<PreferenceTheme>[] = PREFERENCES_THEME.map(
    (valeur) => ({ valeur, libelle: t(LIBELLES_THEME[valeur]) }),
  );
  const choixLangue: readonly ChoixPreference<Langue>[] = LANGUES.map((valeur) => ({
    valeur,
    libelle: t(LIBELLES_LANGUE[valeur]),
  }));

  return (
    <ScrollView contentContainerStyle={styles.conteneur}>
      <View style={styles.entete}>
        <Pressable
          accessibilityLabel={t('preferences.retour')}
          accessibilityRole="button"
          onPress={revenir}
          style={[styles.retour, focusRetour.focalise && styles.focalise]}
          {...focusRetour.proprietesFocus}
        >
          <Text style={styles.texteRetour}>←</Text>
        </Pressable>
        <View style={styles.titres}>
          <Text accessibilityRole="header" style={styles.titre}>
            {t('preferences.titre')}
          </Text>
          <Text style={styles.sousTitre}>{t('preferences.sousTitre')}</Text>
        </View>
      </View>
      {stockageEchoue ? (
        <View accessibilityRole="alert" style={styles.alerte}>
          <Text style={styles.texteAlerte}>{t('preferences.stockageEchoue')}</Text>
          <Pressable
            accessibilityLabel={t('preferences.reessayerStockage')}
            accessibilityRole="button"
            onPress={reessayerStockage}
            style={[styles.boutonAlerte, focusReessai.focalise && styles.focalise]}
            {...focusReessai.proprietesFocus}
          >
            <Text style={styles.texteBoutonAlerte}>{t('preferences.reessayerStockage')}</Text>
          </Pressable>
        </View>
      ) : null}
      <GroupeChoixPreference
        choisir={choisirTheme}
        choix={choixTheme}
        description={t('preferences.theme.description')}
        titre={t('preferences.theme.titre')}
        valeur={preferenceTheme}
      />
      <GroupeChoixPreference
        choisir={choisirLangue}
        choix={choixLangue}
        description={t('preferences.langue.description')}
        titre={t('preferences.langue.titre')}
        valeur={langue}
      />
    </ScrollView>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    conteneur: {
      width: '100%',
      maxWidth: theme.layout.dialogMaxWidth,
      alignSelf: 'center',
      padding: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    entete: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    retour: {
      minWidth: theme.minTargetSize,
      minHeight: theme.minTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
    },
    texteRetour: {
      color: theme.colors.primary,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    focalise: {
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.focus,
    },
    titres: { flexShrink: 1, gap: theme.spacing.xs },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.sectionTitle,
      fontWeight: '700',
    },
    sousTitre: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption,
    },
    alerte: {
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dangerBackground,
    },
    texteAlerte: {
      color: theme.colors.dangerText,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
    },
    boutonAlerte: {
      minHeight: theme.minTargetSize,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    texteBoutonAlerte: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
  });
