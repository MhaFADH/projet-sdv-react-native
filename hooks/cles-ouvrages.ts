import { creerCriteresOuvrages } from '@/domain/criteres-ouvrages';

export const clesOuvrages = {
  listes: () => ['ouvrages', 'liste'] as const,
  liste: (page: number, recherche = '') =>
    ['ouvrages', 'liste', creerCriteresOuvrages(page, recherche)] as const,
  fiche: (id: string) => ['ouvrages', 'fiche', id] as const,
};
