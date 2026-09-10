import { StyleSheet, Text, View } from 'react-native';
import { libelleStatutLecture, type Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

type StatutLectureProps = Pick<Ouvrage, 'lu'>;

export const StatutLecture = ({ lu }: StatutLectureProps) => (
  <View style={[styles.statut, lu && styles.statutLu]}>
    <Text style={[styles.texteStatut, lu && styles.texteStatutLu]}>{libelleStatutLecture(lu)}</Text>
  </View>
);

const styles = StyleSheet.create({
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
