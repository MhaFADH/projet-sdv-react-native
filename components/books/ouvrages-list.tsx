import { StyleSheet, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import type { AvisReessai } from './avis-echec-bascule';
import { LigneOuvrage } from './ligne-ouvrage';

export type CoupsDeCoeurFonds = {
  basculer: (ouvrage: Ouvrage) => void;
  enCours: (id: string) => boolean;
  erreur: (id: string) => AvisReessai | undefined;
};

type OuvragesListProps = {
  ouvrages: Ouvrage[];
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
      {ouvrages.map((ouvrage) => (
        <LigneOuvrage
          basculeEnCours={coupsDeCoeur.enCours(ouvrage.id)}
          basculerCoupDeCoeur={() => coupsDeCoeur.basculer(ouvrage)}
          basculerSelection={() => basculerSelection(ouvrage.id)}
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
