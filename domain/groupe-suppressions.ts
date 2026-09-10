export const DELAI_ANNULATION_SUPPRESSION_MS = 5_000;

export type OuvrageASupprimer = {
  id: string;
  titre: string;
};

export type EtatGroupeSuppressions = {
  phase: 'repos' | 'attente' | 'envoi';
  ouvrages: OuvrageASupprimer[];
  echeance: number | null;
  echecs: OuvrageASupprimer[];
};

export const creerEtatGroupeSuppressions = (): EtatGroupeSuppressions => ({
  phase: 'repos',
  ouvrages: [],
  echeance: null,
  echecs: [],
});

const fusionnerSansDoublon = (
  existants: OuvrageASupprimer[],
  ajoutes: OuvrageASupprimer[],
): OuvrageASupprimer[] => {
  const ids = new Set(existants.map(({ id }) => id));
  const resultat = [...existants];
  for (const ouvrage of ajoutes) {
    if (!ids.has(ouvrage.id)) {
      ids.add(ouvrage.id);
      resultat.push(ouvrage);
    }
  }
  return resultat;
};

export const ajouterAuGroupe = (
  etat: EtatGroupeSuppressions,
  ouvrages: OuvrageASupprimer[],
  maintenant: number,
): EtatGroupeSuppressions => {
  if (etat.phase === 'envoi' || ouvrages.length === 0) return etat;
  return {
    ...etat,
    phase: 'attente',
    ouvrages: fusionnerSansDoublon(etat.ouvrages, ouvrages),
    echeance: maintenant + DELAI_ANNULATION_SUPPRESSION_MS,
  };
};

export const annulerGroupe = (etat: EtatGroupeSuppressions): EtatGroupeSuppressions => {
  if (etat.phase !== 'attente') return etat;
  return { ...etat, phase: 'repos', ouvrages: [], echeance: null };
};

export const abandonnerAvantEnvoi = (etat: EtatGroupeSuppressions): EtatGroupeSuppressions =>
  annulerGroupe(etat);

export const demarrerEnvoi = (
  etat: EtatGroupeSuppressions,
  maintenant: number,
): EtatGroupeSuppressions => {
  if (etat.phase !== 'attente' || etat.echeance === null || maintenant < etat.echeance) return etat;
  const idsEnvoyes = new Set(etat.ouvrages.map(({ id }) => id));
  return {
    ...etat,
    phase: 'envoi',
    echeance: null,
    echecs: etat.echecs.filter(({ id }) => !idsEnvoyes.has(id)),
  };
};

export const terminerEnvoi = (
  etat: EtatGroupeSuppressions,
  idsEnEchec: string[],
): EtatGroupeSuppressions => {
  if (etat.phase !== 'envoi') return etat;
  const ids = new Set(idsEnEchec);
  const nouveauxEchecs = etat.ouvrages.filter(({ id }) => ids.has(id));
  return {
    phase: 'repos',
    ouvrages: [],
    echeance: null,
    echecs: fusionnerSansDoublon(etat.echecs, nouveauxEchecs),
  };
};

export const secondesRestantes = (etat: EtatGroupeSuppressions, maintenant: number): number => {
  if (etat.phase !== 'attente' || etat.echeance === null) return 0;
  return Math.max(0, Math.ceil((etat.echeance - maintenant) / 1_000));
};
