import { OUVRAGES_PAR_PAGE, TRI_FONDS } from '@/domain/ouvrage';

export const clesOuvrages = {
  liste: (page: number) =>
    [
      'ouvrages',
      'liste',
      { page, limit: OUVRAGES_PAR_PAGE, sort: TRI_FONDS.champ, order: TRI_FONDS.ordre },
    ] as const,
  fiche: (id: string) => ['ouvrages', 'fiche', id] as const,
};
