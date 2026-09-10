import { OUVRAGES_PAR_PAGE, TRI_FONDS } from './ouvrage';

export type CriteresOuvrages = {
  page: number;
  limit: typeof OUVRAGES_PAR_PAGE;
  q: string;
  sort: typeof TRI_FONDS.champ;
  order: typeof TRI_FONDS.ordre;
};

export const creerCriteresOuvrages = (page: number, recherche: string): CriteresOuvrages => ({
  page,
  limit: OUVRAGES_PAR_PAGE,
  q: recherche,
  sort: TRI_FONDS.champ,
  order: TRI_FONDS.ordre,
});

export const lireRecherche = (valeur: string | string[] | undefined): string => {
  if (Array.isArray(valeur)) return valeur[0] ?? '';
  return valeur ?? '';
};
