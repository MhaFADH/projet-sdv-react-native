import { useRef, useState } from 'react';
import type { View as VueNative } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ValeurNotation } from '@/domain/notation-ouvrage';
import type { Ouvrage } from '@/domain/ouvrage';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import { creerNavigationGroupeRadio } from '@/services/plateforme/activation-clavier';
import type { Theme } from '@/theme/tokens';

const VALEURS_NOTATION = [0, 1, 2, 3, 4, 5] as const satisfies readonly ValeurNotation[];

type ProprietesControleNotation = {
  ouvrage: Ouvrage;
  noter: (valeur: ValeurNotation) => void;
  modificationEnCours: boolean;
};

type ProprietesCommandeNotation = {
  note: ValeurNotation;
  noteActuelle: number | null;
  noteFocalisee: number | null;
  modificationEnCours: boolean;
  noter: (valeur: ValeurNotation) => void;
  noterIndex: (index: number) => void;
  definirReference: (note: ValeurNotation, element: VueNative | null) => void;
  focaliser: (note: ValeurNotation | null) => void;
};

const CommandeNotation = ({
  note,
  noteActuelle,
  noteFocalisee,
  modificationEnCours,
  noter,
  noterIndex,
  definirReference,
  focaliser,
}: ProprietesCommandeNotation) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const selectionnee = noteActuelle === note;
  const remplie = note > 0 && noteActuelle !== null && note <= noteActuelle;
  const selectionner = () => noter(note);
  const libelle = t(note === 0 ? 'fiche.attribuerZero' : 'fiche.attribuerNotation', {
    count: note,
  });
  return (
    <Pressable
      {...creerNavigationGroupeRadio({
        activer: selectionner,
        precedent: () => noterIndex(note - 1),
        suivant: () => noterIndex(note + 1),
        premier: () => noterIndex(0),
        dernier: () => noterIndex(VALEURS_NOTATION.length - 1),
      })}
      accessibilityLabel={libelle}
      accessibilityRole="radio"
      accessibilityState={{
        checked: selectionnee,
        disabled: modificationEnCours,
        selected: selectionnee,
      }}
      aria-checked={selectionnee}
      aria-disabled={modificationEnCours}
      disabled={modificationEnCours}
      onBlur={() => focaliser(null)}
      onFocus={() => focaliser(note)}
      onPress={selectionner}
      ref={(element) => definirReference(note, element)}
      style={[
        styles.bouton,
        selectionnee && styles.boutonSelectionne,
        note === noteFocalisee && styles.boutonFocalise,
        modificationEnCours && styles.boutonDesactive,
      ]}
      tabIndex={selectionnee || (noteActuelle === null && note === 0) ? 0 : -1}
    >
      <Text selectable={false} style={[styles.etoile, selectionnee && styles.etoileSelectionnee]}>
        {note === 0 ? '0' : remplie ? '★' : '☆'}
      </Text>
    </Pressable>
  );
};

export const ControleNotation = ({
  ouvrage,
  noter,
  modificationEnCours,
}: ProprietesControleNotation) => {
  const t = useTraduction();
  const { nombre } = useFormats();
  const styles = useStylesTheme(creerStyles);
  const [noteFocalisee, setNoteFocalisee] = useState<number | null>(null);
  const references = useRef<Array<VueNative | null>>([]);
  const valeur =
    ouvrage.note === null
      ? t('fiche.aucuneNotation')
      : t('fiche.notationValeur', { note: nombre(ouvrage.note) });
  const noterIndex = (index: number) => {
    const indexNormalise = (index + VALEURS_NOTATION.length) % VALEURS_NOTATION.length;
    noter(VALEURS_NOTATION[indexNormalise]);
    references.current[indexNormalise]?.focus();
  };
  const definirReference = (note: ValeurNotation, element: VueNative | null) => {
    references.current[note] = element;
  };

  return (
    <View style={styles.conteneur}>
      <Text style={styles.libelle}>{t('fiche.notation')}</Text>
      <Text accessibilityLiveRegion="polite" style={styles.valeur}>
        {valeur}
      </Text>
      <View
        accessibilityLabel={t('fiche.choisirNotation')}
        accessibilityRole="radiogroup"
        style={styles.choix}
      >
        {VALEURS_NOTATION.map((note) => (
          <CommandeNotation
            definirReference={definirReference}
            focaliser={setNoteFocalisee}
            key={note}
            modificationEnCours={modificationEnCours}
            note={note}
            noteActuelle={ouvrage.note}
            noteFocalisee={noteFocalisee}
            noter={noter}
            noterIndex={noterIndex}
          />
        ))}
      </View>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    conteneur: { gap: theme.spacing.xs },
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
    choix: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    bouton: {
      width: theme.minTargetSize,
      minHeight: theme.minTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
    },
    boutonSelectionne: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    boutonFocalise: { borderColor: theme.colors.focus },
    boutonDesactive: { opacity: 0.65 },
    etoile: {
      color: theme.colors.primary,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    etoileSelectionnee: { color: theme.colors.primaryText },
  });
