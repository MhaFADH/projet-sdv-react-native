import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OuvrageASupprimer } from '@/domain/groupe-suppressions';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type BandeauSuppressionsProps = {
  nombreEnAttente: number;
  secondes: number;
  envoi: boolean;
  echecs: OuvrageASupprimer[];
  annulerTout: () => void;
  reessayer: () => void;
};

const Avertissement = () => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return <Text style={styles.avertissement}>{t('suppressions.avertissement')}</Text>;
};

export const BandeauSuppressions = ({
  nombreEnAttente,
  secondes,
  envoi,
  echecs,
  annulerTout,
  reessayer,
}: BandeauSuppressionsProps) => {
  const t = useTraduction();
  const { nombre } = useFormats();
  const styles = useStylesTheme(creerStyles);
  if (nombreEnAttente === 0 && echecs.length === 0) return null;

  return (
    <View style={styles.zone}>
      {nombreEnAttente > 0 ? (
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.bandeau}>
          <Text style={styles.titre}>
            {envoi
              ? t('suppressions.bandeauEnvoi', {
                  count: nombreEnAttente,
                  nombre: nombre(nombreEnAttente),
                })
              : t('suppressions.bandeauAttente', {
                  count: nombreEnAttente,
                  nombre: nombre(nombreEnAttente),
                  secondes: nombre(secondes),
                })}
          </Text>
          <Avertissement />
          {!envoi ? (
            <Pressable
              accessibilityLabel={t('suppressions.annulerToutLibelle')}
              accessibilityRole="button"
              onPress={annulerTout}
              style={styles.bouton}
            >
              <Text style={styles.texteBouton}>{t('suppressions.annulerTout')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {echecs.length > 0 ? (
        <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.erreur}>
          <Text style={styles.titreErreur}>{t('suppressions.echecsTitre')}</Text>
          <Text style={styles.texteErreur}>{echecs.map(({ titre }) => titre).join(', ')}</Text>
          <Pressable
            accessibilityLabel={t('suppressions.reessayerEchecs', {
              count: echecs.length,
              nombre: nombre(echecs.length),
            })}
            accessibilityRole="button"
            disabled={envoi}
            onPress={reessayer}
            style={[styles.boutonErreur, envoi && styles.boutonDesactive]}
          >
            <Text style={styles.texteBoutonErreur}>{t('etats.reessayer')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    zone: {
      position: 'absolute',
      right: theme.spacing.md,
      bottom: theme.spacing.md,
      left: theme.spacing.md,
      alignItems: 'center',
      gap: theme.spacing.sm,
      pointerEvents: 'box-none',
    },
    bandeau: {
      width: '100%',
      maxWidth: theme.layout.contentMaxWidth,
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
    },
    erreur: {
      width: '100%',
      maxWidth: theme.layout.contentMaxWidth,
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.dangerText,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dangerBackground,
    },
    titre: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: '700' },
    avertissement: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption,
      lineHeight: theme.typography.bodyLineHeight,
    },
    titreErreur: {
      color: theme.colors.dangerText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    texteErreur: { color: theme.colors.dangerText, fontSize: theme.typography.body },
    bouton: {
      minHeight: theme.minTargetSize,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    texteBouton: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    boutonErreur: {
      minHeight: theme.minTargetSize,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.dangerText,
    },
    boutonDesactive: { opacity: 0.5 },
    texteBoutonErreur: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
  });
