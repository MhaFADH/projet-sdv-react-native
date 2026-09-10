import { OUVRAGES_PAR_PAGE } from './ouvrage';

const LECTURES_FONDS = ['tous', 'lu', 'nonlu'] as const;
const RECOMMANDATIONS_FONDS = ['toutes', 'favoris'] as const;
const TRIS_FONDS = ['titre', 'auteur', 'annee', 'note'] as const;
const ORDRES_FONDS = ['asc', 'desc'] as const;

export type FiltreLecture = (typeof LECTURES_FONDS)[number];
export type FiltreRecommandation = (typeof RECOMMANDATIONS_FONDS)[number];
export type TriFonds = (typeof TRIS_FONDS)[number];
export type OrdreFonds = (typeof ORDRES_FONDS)[number];

export type ConsultationFonds = {
  recherche: string;
  lecture: FiltreLecture;
  recommandation: FiltreRecommandation;
  tri: TriFonds;
  ordre: OrdreFonds;
};

export type ParametresConsultation = {
  q?: string;
  status?: Exclude<FiltreLecture, 'tous'>;
  favori?: 'true';
  sort?: Exclude<TriFonds, 'titre'>;
  order?: Exclude<OrdreFonds, 'asc'>;
};

export type CriteresOuvrages = {
  page: number;
  limit: typeof OUVRAGES_PAR_PAGE;
  q: string;
  status?: Exclude<FiltreLecture, 'tous'>;
  favori?: true;
  sort: TriFonds;
  order: OrdreFonds;
};

export const CONSULTATION_FONDS_PAR_DEFAUT: ConsultationFonds = {
  recherche: '',
  lecture: 'tous',
  recommandation: 'toutes',
  tri: 'titre',
  ordre: 'asc',
};

export const encoderConsultation = (consultation: ConsultationFonds): ParametresConsultation => ({
  q: consultation.recherche || undefined,
  status: consultation.lecture === 'tous' ? undefined : consultation.lecture,
  favori: consultation.recommandation === 'favoris' ? 'true' : undefined,
  sort: consultation.tri === 'titre' ? undefined : consultation.tri,
  order: consultation.ordre === 'asc' ? undefined : consultation.ordre,
});

export const consultationsEgales = (
  gauche: ConsultationFonds,
  droite: ConsultationFonds,
): boolean =>
  gauche.recherche === droite.recherche &&
  gauche.lecture === droite.lecture &&
  gauche.recommandation === droite.recommandation &&
  gauche.tri === droite.tri &&
  gauche.ordre === droite.ordre;

export const creerCriteresOuvrages = (
  page: number,
  consultation: ConsultationFonds,
): CriteresOuvrages => ({
  page,
  limit: OUVRAGES_PAR_PAGE,
  q: consultation.recherche,
  status: consultation.lecture === 'tous' ? undefined : consultation.lecture,
  favori: consultation.recommandation === 'favoris' ? true : undefined,
  sort: consultation.tri,
  order: consultation.ordre,
});

const lireValeur = (valeur: string | string[] | undefined): string | undefined =>
  Array.isArray(valeur) ? valeur[0] : valeur;

const lireChoix = <Choix extends string>(
  valeur: string | string[] | undefined,
  choix: readonly Choix[],
  valeurParDefaut: Choix,
): Choix => {
  const valeurLue = lireValeur(valeur);
  return choix.find((candidat) => candidat === valeurLue) ?? valeurParDefaut;
};

export const lireRecherche = (valeur: string | string[] | undefined): string =>
  lireValeur(valeur) ?? '';

export const lireFiltreLecture = (valeur: string | string[] | undefined): FiltreLecture =>
  lireChoix(valeur, LECTURES_FONDS, CONSULTATION_FONDS_PAR_DEFAUT.lecture);

export const lireFiltreRecommandation = (
  valeur: string | string[] | undefined,
): FiltreRecommandation =>
  lireValeur(valeur) === 'true' ? 'favoris' : CONSULTATION_FONDS_PAR_DEFAUT.recommandation;

export const lireTriFonds = (valeur: string | string[] | undefined): TriFonds =>
  lireChoix(valeur, TRIS_FONDS, CONSULTATION_FONDS_PAR_DEFAUT.tri);

export const lireOrdreFonds = (valeur: string | string[] | undefined): OrdreFonds =>
  lireChoix(valeur, ORDRES_FONDS, CONSULTATION_FONDS_PAR_DEFAUT.ordre);
