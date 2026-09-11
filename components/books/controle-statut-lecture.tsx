import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme, useTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type ControleStatutLectureProps = {
  ouvrage: Ouvrage;
  basculerStatut: () => void;
  basculeEnCours: boolean;
};

export const ControleStatutLecture = ({
  ouvrage,
  basculerStatut,
  basculeEnCours,
}: ControleStatutLectureProps) => {
  const t = useTraduction();
  const theme = useTheme();
  const styles = useStylesTheme(creerStyles);
  const action = t(ouvrage.lu ? 'fiche.marquerNonLu' : 'fiche.marquerLu');
  return (
    <View style={styles.renseignement}>
      <Text style={styles.libelle}>{t('fiche.statutCollectif')}</Text>
      <Text style={styles.valeur}>{t(ouvrage.lu ? 'ouvrage.lu' : 'ouvrage.nonLu')}</Text>
      <Pressable
        accessibilityLabel={action}
        accessibilityRole="switch"
        accessibilityState={{ checked: ouvrage.lu, disabled: basculeEnCours }}
        aria-checked={ouvrage.lu}
        aria-disabled={basculeEnCours}
        disabled={basculeEnCours}
        onPress={basculerStatut}
        style={[styles.boutonStatut, basculeEnCours && styles.boutonDesactive]}
      >
        <Text
          selectable={false}
          style={[styles.texteBoutonStatut, basculeEnCours && styles.texteMasque]}
        >
          {action}
        </Text>
        {basculeEnCours ? (
          <ActivityIndicator
            accessibilityLabel={t('fiche.statutEnCours')}
            color={theme.colors.primaryText}
            size="small"
            style={styles.indicateurStatut}
          />
        ) : null}
      </Pressable>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
    boutonStatut: {
      minHeight: theme.minTargetSize,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
    },
    boutonDesactive: { opacity: 0.65 },
    texteBoutonStatut: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    texteMasque: { opacity: 0 },
    indicateurStatut: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  });
