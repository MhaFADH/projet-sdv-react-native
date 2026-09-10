import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type PageOuvrages, PREMIERE_PAGE } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

type PaginationProps = Pick<PageOuvrages, 'page' | 'total' | 'totalPages'> & {
  pagePrecedente: () => void;
  pageSuivante: () => void;
  navigationDesactivee?: boolean;
};

type BoutonPaginationProps = {
  libelle: string;
  desactive: boolean;
  action: () => void;
};

const BoutonPagination = ({ libelle, desactive, action }: BoutonPaginationProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: desactive }}
    disabled={desactive}
    onPress={action}
    style={[styles.bouton, desactive && styles.boutonDesactive]}
  >
    <Text style={[styles.texteBouton, desactive && styles.texteBoutonDesactive]}>{libelle}</Text>
  </Pressable>
);

export const Pagination = ({
  page,
  total,
  totalPages,
  pagePrecedente,
  pageSuivante,
  navigationDesactivee = false,
}: PaginationProps) => {
  const libelleTotal = total === 1 ? 'ouvrage' : 'ouvrages';
  return (
    <View accessibilityLabel="Pagination des ouvrages" style={styles.conteneur}>
      <Text accessibilityLiveRegion="polite" style={styles.resume}>
        Page {page} sur {totalPages} · {total} {libelleTotal}
      </Text>
      <View style={styles.actions}>
        <BoutonPagination
          action={pagePrecedente}
          desactive={navigationDesactivee || page <= PREMIERE_PAGE}
          libelle="Précédent"
        />
        <BoutonPagination
          action={pageSuivante}
          desactive={navigationDesactivee || page >= totalPages}
          libelle="Suivant"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  resume: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  bouton: {
    minWidth: theme.layout.paginationButtonMinWidth,
    minHeight: theme.minTargetSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  boutonDesactive: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  texteBouton: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  texteBoutonDesactive: {
    color: theme.colors.textMuted,
  },
});
