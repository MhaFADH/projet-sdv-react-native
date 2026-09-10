import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  type ConsultationFonds,
  creerCriteresOuvrages,
} from '@/domain/criteres-ouvrages';

export const clesOuvrages = {
  listes: () => ['ouvrages', 'liste'] as const,
  liste: (page: number, consultation: ConsultationFonds = CONSULTATION_FONDS_PAR_DEFAUT) =>
    ['ouvrages', 'liste', creerCriteresOuvrages(page, consultation)] as const,
  fiche: (id: string) => ['ouvrages', 'fiche', id] as const,
};
