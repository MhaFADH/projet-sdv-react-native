import { StyleSheet, View } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import type { CoupsDeCoeurFonds, OuvrageIllustre } from './etat-fonds';
import { LigneOuvrage } from './ligne-ouvrage';

type OuvragesListProps = {
  ouvrages: OuvrageIllustre[];
  identifiantsSelectionnes: ReadonlySet<string>;
  basculerSelection: (id: string) => void;
  ouvrirOuvrage: (id: string) => void;
  coupsDeCoeur: CoupsDeCoeurFonds;
  ouvertureDesactivee?: boolean;
  selectionDesactivee?: boolean;
};

export const OuvragesList = ({
  ouvrages,
  identifiantsSelectionnes,
  basculerSelection,
  ouvrirOuvrage,
  coupsDeCoeur,
  ouvertureDesactivee = false,
  selectionDesactivee = false,
}: OuvragesListProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <View accessibilityLabel={t('fonds.liste')} role="list" style={styles.liste}>
      {ouvrages.map(({ ouvrage, couverture }) => (
        <LigneOuvrage
          basculeEnCours={coupsDeCoeur.enCours(ouvrage.id)}
          basculerCoupDeCoeur={() => coupsDeCoeur.basculer(ouvrage)}
          basculerSelection={() => basculerSelection(ouvrage.id)}
          couverture={couverture}
          erreurBascule={coupsDeCoeur.erreur(ouvrage.id)}
          key={ouvrage.id}
          ouvertureDesactivee={ouvertureDesactivee}
          ouvrage={ouvrage}
          ouvrirOuvrage={() => ouvrirOuvrage(ouvrage.id)}
          selectionDesactivee={selectionDesactivee}
          selectionne={identifiantsSelectionnes.has(ouvrage.id)}
        />
      ))}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    liste: {
      gap: theme.spacing.md,
    },
  });
