import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type PageOuvrages, PREMIERE_PAGE } from '@/domain/ouvrage';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

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

const BoutonPagination = ({ libelle, desactive, action }: BoutonPaginationProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
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
};

export const Pagination = ({
  page,
  total,
  totalPages,
  pagePrecedente,
  pageSuivante,
  navigationDesactivee = false,
}: PaginationProps) => {
  const t = useTraduction();
  const { nombre } = useFormats();
  const styles = useStylesTheme(creerStyles);

  return (
    <View accessibilityLabel={t('pagination.libelle')} style={styles.conteneur}>
      <Text accessibilityLiveRegion="polite" style={styles.resume}>
        {t('pagination.resume', {
          page: nombre(page),
          totalPages: nombre(totalPages),
          total: nombre(total),
          unite: t('pagination.unite', { count: total }),
        })}
      </Text>
      <View style={styles.actions}>
        <BoutonPagination
          action={pagePrecedente}
          desactive={navigationDesactivee || page <= PREMIERE_PAGE}
          libelle={t('pagination.precedent')}
        />
        <BoutonPagination
          action={pageSuivante}
          desactive={navigationDesactivee || page >= totalPages}
          libelle={t('pagination.suivant')}
        />
      </View>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
