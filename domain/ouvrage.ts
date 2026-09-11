export const ANNEE_PUBLICATION_MINIMALE = 1450;
export const NOMBRE_ANNEES_FUTURES_AUTORISEES = 1;
export const PREMIERE_PAGE = 1;
export const PAS_DE_PAGE = 1;
export const OUVRAGES_PAR_PAGE = 20;

export type Ouvrage = {
  id: string;
  titre: string;
  auteur: string;
  editeur: string;
  annee: number;
  lu: boolean;
  favori: boolean;
  note: number | null;
  couverture: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PageOuvrages = {
  items: Ouvrage[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const lireNumeroPage = (valeur: string | string[] | undefined): number => {
  const brut = Array.isArray(valeur) ? valeur[0] : valeur;
  if (brut === undefined || !/^\d+$/.test(brut.trim())) return PREMIERE_PAGE;
  const numero = Number.parseInt(brut, 10);
  return numero < PREMIERE_PAGE ? PREMIERE_PAGE : numero;
};

export const identifiantUtilisable = (id: string): boolean => id.trim() !== '';

export const conserverOuvragePlusRecent = (courant: Ouvrage, recu: Ouvrage): Ouvrage =>
  courant.version > recu.version ? courant : recu;

export const conserverVersionsPage = (
  courante: PageOuvrages | undefined,
  recue: PageOuvrages,
): PageOuvrages => {
  if (!courante) return recue;
  const ouvragesCourants = new Map(courante.items.map((ouvrage) => [ouvrage.id, ouvrage]));
  return {
    ...recue,
    items: recue.items.map((ouvrage) => {
      const courant = ouvragesCourants.get(ouvrage.id);
      return courant ? conserverOuvragePlusRecent(courant, ouvrage) : ouvrage;
    }),
  };
};
