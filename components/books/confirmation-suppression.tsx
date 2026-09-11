import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { OuvrageASupprimer } from '@/domain/groupe-suppressions';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type ConfirmationSuppressionProps = {
  visible: boolean;
  ouvrages: OuvrageASupprimer[];
  annuler: () => void;
  confirmer: () => void;
  desactivee?: boolean;
};

export const ConfirmationSuppression = ({
  visible,
  ouvrages,
  annuler,
  confirmer,
  desactivee = false,
}: ConfirmationSuppressionProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <Modal animationType="fade" onRequestClose={annuler} transparent visible={visible}>
      <View style={styles.fond}>
        <View
          accessibilityLabel={t('suppressions.dialogue')}
          accessibilityViewIsModal
          role="dialog"
          style={styles.dialogue}
        >
          <Text accessibilityRole="header" style={styles.titre}>
            {t('suppressions.titre')}
          </Text>
          <Text style={styles.texte}>{t('suppressions.resume', { count: ouvrages.length })}</Text>
          <View accessibilityLabel={t('suppressions.liste')} role="list" style={styles.liste}>
            {ouvrages.map((ouvrage) => (
              <Text key={ouvrage.id} role="listitem" style={styles.ouvrage}>
                {ouvrage.titre}
              </Text>
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel={t('suppressions.renoncerLibelle')}
              accessibilityRole="button"
              onPress={annuler}
              style={styles.boutonSecondaire}
            >
              <Text style={styles.texteSecondaire}>{t('suppressions.renoncer')}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('suppressions.confirmerLibelle')}
              accessibilityRole="button"
              accessibilityState={{ disabled: desactivee }}
              disabled={desactivee}
              onPress={confirmer}
              style={[styles.boutonDanger, desactivee && styles.boutonDesactive]}
            >
              <Text style={styles.texteDanger}>
                {t(desactivee ? 'suppressions.envoiEnCours' : 'suppressions.confirmer')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    fond: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.overlay,
    },
    dialogue: {
      width: '100%',
      maxWidth: theme.layout.dialogMaxWidth,
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.sectionTitle,
      fontWeight: '700',
    },
    texte: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
    },
    liste: { gap: theme.spacing.xs },
    ouvrage: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: '600' },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
    },
    boutonSecondaire: {
      minHeight: theme.minTargetSize,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
    },
    boutonDanger: {
      minHeight: theme.minTargetSize,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.dangerText,
    },
    boutonDesactive: { opacity: 0.5 },
    texteSecondaire: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    texteDanger: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
  });
