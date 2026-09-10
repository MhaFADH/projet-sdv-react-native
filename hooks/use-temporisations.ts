import { useCallback, useEffect, useState } from 'react';

const DELAI_TEMPORISATION_MS = 3_000;
const FREQUENCE_COMPTEUR_MS = 250;
const MILLISECONDES_PAR_SECONDE = 1_000;

const sansCle = (echeances: Record<string, number>, cle: string): Record<string, number> =>
  Object.fromEntries(Object.entries(echeances).filter(([courante]) => courante !== cle));

export const useTemporisations = (delaiMs: number = DELAI_TEMPORISATION_MS) => {
  const [echeances, setEcheances] = useState<Record<string, number>>({});
  const [maintenant, setMaintenant] = useState(Date.now);

  const enCours = Object.values(echeances).some((echeance) => echeance > maintenant);

  useEffect(() => {
    if (!enCours) return;
    const rythme = setInterval(() => setMaintenant(Date.now()), FREQUENCE_COMPTEUR_MS);
    return () => clearInterval(rythme);
  }, [enCours]);

  const demarrer = useCallback(
    (cle: string) => {
      const depart = Date.now();
      setMaintenant(depart);
      setEcheances((courantes) => ({ ...courantes, [cle]: depart + delaiMs }));
    },
    [delaiMs],
  );

  const arreter = useCallback(
    (cle: string) => setEcheances((courantes) => sansCle(courantes, cle)),
    [],
  );

  const secondesRestantes = (cle: string): number =>
    Math.max(0, Math.ceil(((echeances[cle] ?? 0) - maintenant) / MILLISECONDES_PAR_SECONDE));

  return { demarrer, arreter, secondesRestantes };
};
