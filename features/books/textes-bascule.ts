import type { AvisReessai } from '@/components/books/avis-echec-bascule';
import type { ChampBascule } from '@/domain/bascule-ouvrage';

const SUJETS: Record<ChampBascule, string> = {
  lu: 'Le statut',
  favori: 'Le coup de cœur',
};

const LIBELLES_REESSAI: Record<ChampBascule, string> = {
  lu: 'Réessayer la modification du statut',
  favori: 'Réessayer la modification du coup de cœur',
};

export const avisEchecBascule = (
  champ: ChampBascule,
  message: string,
  reessayer: () => void,
): AvisReessai => ({
  message: `${SUJETS[champ]} précédent a été restauré. ${message}`,
  libelleReessai: LIBELLES_REESSAI[champ],
  reessayer,
});

export const avisEchecActualisation = (
  champ: ChampBascule,
  message: string,
  reessayer: () => void,
): AvisReessai => ({
  message: `${SUJETS[champ]} a été enregistré, mais la fiche n’a pas pu être actualisée. ${message}`,
  libelleReessai: 'Réessayer l’actualisation de la fiche',
  reessayer,
});
