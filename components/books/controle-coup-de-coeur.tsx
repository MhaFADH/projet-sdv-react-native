import { StyleSheet, Text, View } from 'react-native';
import { libelleCoupDeCoeur } from '@/domain/bascule-ouvrage';
import type { Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';
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
}: ControleCoupDeCoeurProps) => (
  <View style={styles.renseignement}>
    <Text style={styles.libelle}>Recommandation collective</Text>
    <View style={styles.ligne}>
      <BoutonCoupDeCoeur
        basculer={basculerCoupDeCoeur}
        enCours={basculeEnCours}
        favori={ouvrage.favori}
      />
      <Text style={styles.valeur}>{libelleCoupDeCoeur(ouvrage.favori)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
