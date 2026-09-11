import { StyleSheet, Text, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type StatutLectureProps = Pick<Ouvrage, 'lu'>;

export const StatutLecture = ({ lu }: StatutLectureProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={[styles.statut, lu && styles.statutLu]}>
      <Text style={[styles.texteStatut, lu && styles.texteStatutLu]}>
        {t(lu ? 'ouvrage.lu' : 'ouvrage.nonLu')}
      </Text>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
