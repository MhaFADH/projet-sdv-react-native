import { useCallback, useEffect, useRef, useState } from 'react';

const DUREE_TOAST_MS = 5_000;

type Annonce<Contenu> = {
  cle: number;
  contenu: Contenu;
};

/**
 * Socle unique des notifications de succès : une annonce visible cinq secondes,
 * suspendue tant que le libraire survole ou parcourt le toast au clavier.
 */
export const useToastSucces = <Contenu>() => {
  const [toast, setToast] = useState<Annonce<Contenu> | null>(null);
  const [suspensions, setSuspensions] = useState(0);
  const restantMs = useRef(DUREE_TOAST_MS);
  const compteur = useRef(0);

  const annoncer = useCallback((contenu: Contenu) => {
    restantMs.current = DUREE_TOAST_MS;
    compteur.current += 1;
    setSuspensions(0);
    setToast({ cle: compteur.current, contenu });
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
