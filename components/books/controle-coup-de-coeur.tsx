import { StyleSheet, Text, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import { BoutonCoupDeCoeur } from './bouton-coup-de-coeur';

type ControleCoupDeCoeurProps = {
  ouvrage: Ouvrage;
  basculerCoupDeCoeur: () => void;
  basculeEnCours: boolean;
};

export const ControleCoupDeCoeur = ({
  ouvrage,
  basculerCoupDeCoeur,
  basculeEnCours,
}: ControleCoupDeCoeurProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={styles.renseignement}>
      <Text style={styles.libelle}>{t('fiche.recommandation')}</Text>
      <View style={styles.ligne}>
        <BoutonCoupDeCoeur
          basculer={basculerCoupDeCoeur}
          enCours={basculeEnCours}
          favori={ouvrage.favori}
        />
        <Text style={styles.valeur}>
          {t(ouvrage.favori ? 'fiche.coupDeCoeurOui' : 'fiche.coupDeCoeurNon')}
        </Text>
      </View>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    renseignement: { gap: theme.spacing.xs },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
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
  });
