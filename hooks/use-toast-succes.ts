import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ouvrage } from '@/domain/ouvrage';

const DUREE_TOAST_MS = 5_000;

export type ToastSucces = {
  cle: number;
  ouvrageId: string;
  titre: string;
};

/**
 * Le temps restant est mémorisé à chaque suspension : un survol ou un focus
 * clavier prolonge le toast sans jamais raccourcir le délai convenu.
 */
export const useToastSucces = () => {
  const [toast, setToast] = useState<ToastSucces | null>(null);
  const [suspensions, setSuspensions] = useState(0);
  const restantMs = useRef(DUREE_TOAST_MS);
  const compteur = useRef(0);

  const annoncer = useCallback((ouvrage: Ouvrage) => {
    restantMs.current = DUREE_TOAST_MS;
    compteur.current += 1;
    setSuspensions(0);
    setToast({ cle: compteur.current, ouvrageId: ouvrage.id, titre: ouvrage.titre });
  }, []);

  const suspendre = useCallback(() => setSuspensions((nombre) => nombre + 1), []);
  const reprendre = useCallback(() => setSuspensions((nombre) => Math.max(0, nombre - 1)), []);

  useEffect(() => {
    if (toast === null || suspensions > 0) return;

    const debut = Date.now();
    const attendu = restantMs.current;
    const minuterie = setTimeout(() => setToast(null), attendu);

    return () => {
      clearTimeout(minuterie);
      restantMs.current = Math.max(0, attendu - (Date.now() - debut));
    };
  }, [toast, suspensions]);

  return { toast, annoncer, suspendre, reprendre };
};
