import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { Ouvrage, PageOuvrages } from '../../domain/ouvrage';
import { BasculesProvider } from '../../features/books/bascules-provider';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { useBascules } from '../../hooks/use-bascules';

export const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';
export const AUTRE_ID = '7b1f4c0e-2d5a-4e8b-9c31-5a6d8e2f0b14';

export const ouvrage: Ouvrage = {
  id: ID,
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: false,
  favori: false,
  note: 4,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

export const autreOuvrage: Ouvrage = { ...ouvrage, id: AUTRE_ID, titre: 'Pierre et Jean' };

export const creerEnvironnement = (items: Ouvrage[] = [ouvrage]) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData<PageOuvrages>(clesOuvrages.liste(1), {
    items,
    page: 1,
    limit: 20,
    total: items.length,
    totalPages: 1,
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <BasculesProvider>{children}</BasculesProvider>
    </QueryClientProvider>
  );
  const { result } = renderHook(() => useBascules(), { wrapper });
  return { client, result };
};

const lirePage = (client: QueryClient) => client.getQueryData<PageOuvrages>(clesOuvrages.liste(1));

export const lireOuvrage = (client: QueryClient, id: string) =>
  lirePage(client)?.items.find((courant) => courant.id === id);
