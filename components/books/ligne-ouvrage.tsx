import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme, useTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { CouvertureResolue } from '@/services/couvertures';
import type { Theme } from '@/theme/tokens';
import { AvisEchecBascule, type AvisReessai } from './avis-echec-bascule';
import { BoutonCoupDeCoeur } from './bouton-coup-de-coeur';
import { CarteLigneOuvrage } from './carte-ligne-ouvrage';
import { CaseSelectionOuvrage } from './case-selection-ouvrage';

export type LigneOuvrageProps = {
  ouvrage: Ouvrage;
  couverture: CouvertureResolue;
  selectionne: boolean;
  basculerSelection: () => void;
  ouvrirOuvrage: () => void;
  ouvertureDesactivee: boolean;
  selectionDesactivee: boolean;
  basculerCoupDeCoeur: () => void;
  basculeEnCours: boolean;
  erreurBascule?: AvisReessai;
};

export const LigneOuvrage = ({
  ouvrage,
  couverture,
  selectionne,
  basculerSelection,
  ouvrirOuvrage,
  ouvertureDesactivee,
  selectionDesactivee,
  basculerCoupDeCoeur,
  basculeEnCours,
  erreurBascule,
}: LigneOuvrageProps) => {
  const t = useTraduction();
  const { nombre } = useFormats();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = useStylesTheme(creerStyles);
  const compact = width < theme.layout.compactBreakpoint;
  const statut = t(ouvrage.lu ? 'ouvrage.lu' : 'ouvrage.nonLu');
  const editeur =
    ouvrage.editeur.trim() === '' ? t('ouvrage.editeurNonRenseigne') : ouvrage.editeur;
  const notation =
    ouvrage.note === null
      ? t('ouvrage.sansNotation')
      : t('ouvrage.notation', { note: nombre(ouvrage.note) });
  const selection = (
    <CaseSelectionOuvrage
      basculer={basculerSelection}
      desactivee={selectionDesactivee}
      selectionne={selectionne}
      titre={ouvrage.titre}
    />
  );
  const carte = (
    <CarteLigneOuvrage
      compacte={compact}
      couverture={couverture}
      editeur={editeur}
      notation={notation}
      ouvertureDesactivee={ouvertureDesactivee}
      ouvrage={ouvrage}
      ouvrirOuvrage={ouvrirOuvrage}
      statut={statut}
    />
  );
  const coupDeCoeur = (
    <BoutonCoupDeCoeur
      basculer={basculerCoupDeCoeur}
      enCours={basculeEnCours}
      favori={ouvrage.favori}
      titre={ouvrage.titre}
    />
  );

  return (
    <View role="listitem" style={styles.element}>
      {compact ? (
        <View style={styles.ligneCompacte}>
          {carte}
          <View style={styles.commandesCompactes}>
            {selection}
            {coupDeCoeur}
          </View>
        </View>
      ) : (
        <View style={styles.ligne}>
          {selection}
          {carte}
          {coupDeCoeur}
        </View>
      )}
      {erreurBascule ? (
        <AvisEchecBascule
          libelleReessai={`${erreurBascule.libelleReessai} : ${ouvrage.titre}`}
          message={erreurBascule.message}
          reessayer={erreurBascule.reessayer}
        />
      ) : null}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    element: {
      gap: theme.spacing.sm,
    },
    ligne: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    ligneCompacte: {
      alignItems: 'stretch',
      gap: theme.spacing.sm,
    },
    commandesCompactes: {
      width: '100%',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
  });
