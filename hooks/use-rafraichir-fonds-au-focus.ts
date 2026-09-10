import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { CONSULTATION_FONDS_PAR_DEFAUT, type ConsultationFonds } from '@/domain/criteres-ouvrages';
import { clesOuvrages } from './cles-ouvrages';

export const useRafraichirFondsAuFocus = (
  page: number,
  consultation: ConsultationFonds = CONSULTATION_FONDS_PAR_DEFAUT,
) => {
  const client = useQueryClient();
  const criteresConsultes = useRef({ page, consultation });
  const premierFocus = useRef(true);
  criteresConsultes.current = { page, consultation };

  useFocusEffect(
    useCallback(() => {
      if (premierFocus.current) {
        premierFocus.current = false;
        return;
      }
      const criteres = criteresConsultes.current;
      void client.invalidateQueries({
        queryKey: clesOuvrages.liste(criteres.page, criteres.consultation),
      });
    }, [client]),
  );
};
