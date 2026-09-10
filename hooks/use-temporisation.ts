import { useCallback, useEffect, useState } from 'react';

const DELAI_TEMPORISATION_MS = 3_000;

const PAS_MS = 1_000;
const MILLISECONDES_PAR_SECONDE = 1_000;

export const useTemporisation = (delaiMs: number = DELAI_TEMPORISATION_MS) => {
  const [restantMs, setRestantMs] = useState(0);
  const enCours = restantMs > 0;

  useEffect(() => {
    if (!enCours) return;
    const rythme = setInterval(() => setRestantMs((reste) => Math.max(0, reste - PAS_MS)), PAS_MS);
    return () => clearInterval(rythme);
  }, [enCours]);

  const demarrer = useCallback(() => setRestantMs(delaiMs), [delaiMs]);
  const arreter = useCallback(() => setRestantMs(0), []);

  return {
    secondesRestantes: Math.ceil(restantMs / MILLISECONDES_PAR_SECONDE),
    demarrer,
    arreter,
  };
};
