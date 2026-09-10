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

export const lireNumeroPage = (valeur: string | string[] | undefined): number => {
  const brut = Array.isArray(valeur) ? valeur[0] : valeur;
  if (brut === undefined || !/^\d+$/.test(brut.trim())) return PREMIERE_PAGE;
  const numero = Number.parseInt(brut, 10);
  return numero < PREMIERE_PAGE ? PREMIERE_PAGE : numero;
};

const EDITEUR_NON_RENSEIGNE = 'Éditeur non renseigné';

export const libelleEditeur = (editeur: string): string =>
  editeur.trim() === '' ? EDITEUR_NON_RENSEIGNE : editeur;

export const libelleEdition = ({ editeur, annee }: Pick<Ouvrage, 'editeur' | 'annee'>): string =>
  `${libelleEditeur(editeur)} · ${annee}`;

export const libelleStatutLecture = (lu: boolean): string => (lu ? 'Lu' : 'Non lu');

export const identifiantUtilisable = (id: string): boolean => id.trim() !== '';
