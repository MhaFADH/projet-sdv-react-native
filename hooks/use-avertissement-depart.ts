import { useEffect, useRef } from 'react';
import { installerAvertissementDepart } from '@/services/plateforme/avertissement-depart';

export const useAvertissementDepart = (saisieModifiee: boolean) => {
  const modifiee = useRef(saisieModifiee);

  useEffect(() => {
    modifiee.current = saisieModifiee;
  }, [saisieModifiee]);

  useEffect(() => installerAvertissementDepart(() => modifiee.current), []);
};
