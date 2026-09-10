export const ANNEE_PUBLICATION_MINIMALE = 1450;
export const NOMBRE_ANNEES_FUTURES_AUTORISEES = 1;
export const PREMIERE_PAGE = 1;
export const PAS_DE_PAGE = 1;
export const OUVRAGES_PAR_PAGE = 20;
export const TRI_FONDS = { champ: 'titre', ordre: 'asc' } as const;

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
