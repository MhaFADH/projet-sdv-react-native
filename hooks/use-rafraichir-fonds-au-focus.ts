import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { clesOuvrages } from './cles-ouvrages';

/**
 * Le retour depuis une fiche ne démonte pas l'écran du fonds : la page consultée
 * est donc réactualisée à chaque nouveau focus, jamais au premier affichage.
 * La page voyage par référence pour que le rappel reste stable : un changement
 * de page ne doit pas déclencher une seconde requête pendant que l'écran a le focus.
 */
export const useRafraichirFondsAuFocus = (page: number) => {
  const client = useQueryClient();
  const pageConsultee = useRef(page);
  const premierFocus = useRef(true);
  pageConsultee.current = page;

  useFocusEffect(
    useCallback(() => {
      if (premierFocus.current) {
        premierFocus.current = false;
        return;
      }
      void client.invalidateQueries({ queryKey: clesOuvrages.liste(pageConsultee.current) });
    }, [client]),
  );
};
