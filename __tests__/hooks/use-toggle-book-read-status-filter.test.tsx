import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ConsultationFonds } from '../../domain/criteres-ouvrages';
import type { Ouvrage, PageOuvrages } from '../../domain/ouvrage';
import { useBooksPage } from '../../hooks/use-books-page';
import { useToggleBookReadStatus } from '../../hooks/use-toggle-book-read-status';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';
const consultation: ConsultationFonds = {
  recherche: '',
  lecture: 'nonlu',
  recommandation: 'toutes',
  tri: 'titre',
  ordre: 'asc',
};
const ouvrage: Ouvrage = {
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

const creerPage = (items: Ouvrage[]): PageOuvrages => ({
  items,
  page: 1,
  limit: 20,
  total: items.length,
  totalPages: 1,
});

const reponsePage = (items: Ouvrage[]) =>
  new Response(JSON.stringify(creerPage(items)), { status: 200 });

const creerEnvironnement = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const resultat = renderHook(
    () => ({
      liste: useBooksPage(1, consultation),
      bascule: useToggleBookReadStatus(ID),
    }),
    { wrapper },
  );
  return { client, resultat };
};

afterEach(() => vi.unstubAllGlobals());

describe('bascule du statut sous filtre de lecture', () => {
  it('garde la ligne pendant le PATCH puis la retire après actualisation confirmée', async () => {
    let confirmerPatch: ((reponse: Response) => void) | undefined;
    let lectures = 0;
    const ouvrageLu = { ...ouvrage, lu: true, version: 4 };
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
        if (initialisation?.method === 'PATCH') {
          return new Promise<Response>((resoudre) => {
            confirmerPatch = resoudre;
          });
        }
        lectures += 1;
        return Promise.resolve(reponsePage(lectures === 1 ? [ouvrage] : []));
      }),
    );
    const { client, resultat } = creerEnvironnement();
    await waitFor(() => expect(resultat.result.current.liste.data).toBeDefined());

    act(() => resultat.result.current.bascule.basculer(true));

    await waitFor(() => expect(resultat.result.current.bascule.enCours).toBe(true));
    expect(resultat.result.current.liste.data?.items).toHaveLength(1);
    expect(resultat.result.current.liste.data?.items[0]?.lu).toBe(true);

    await act(async () =>
      confirmerPatch?.(new Response(JSON.stringify(ouvrageLu), { status: 200 })),
    );
    await waitFor(() => expect(resultat.result.current.liste.data?.items).toHaveLength(0));
    expect(lectures).toBe(2);
    client.clear();
  });

  it('restaure la ligne sans la faire disparaître lorsque le PATCH est refusé', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) =>
        Promise.resolve(
          initialisation?.method === 'PATCH'
            ? new Response(JSON.stringify({ erreur: 'refus', message: 'Modification refusée.' }), {
                status: 422,
              })
            : reponsePage([ouvrage]),
        ),
      ),
    );
    const { client, resultat } = creerEnvironnement();
    await waitFor(() => expect(resultat.result.current.liste.data).toBeDefined());

    act(() => resultat.result.current.bascule.basculer(true));

    await waitFor(() => expect(resultat.result.current.bascule.erreur).toBeDefined());
    expect(resultat.result.current.liste.data?.items).toHaveLength(1);
    expect(resultat.result.current.liste.data?.items[0]?.lu).toBe(false);
    client.clear();
  });

  it('conserve le statut confirmé et expose l’échec distinct de la relecture', async () => {
    let lectures = 0;
    const ouvrageLu = { ...ouvrage, lu: true, version: 4 };
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
        if (initialisation?.method === 'PATCH') {
          return Promise.resolve(new Response(JSON.stringify(ouvrageLu), { status: 200 }));
        }
        lectures += 1;
        return Promise.resolve(
          lectures === 1
            ? reponsePage([ouvrage])
            : new Response(JSON.stringify({ erreur: 'lecture', message: 'Lecture impossible.' }), {
                status: 400,
              }),
        );
      }),
    );
    const { client, resultat } = creerEnvironnement();
    await waitFor(() => expect(resultat.result.current.liste.data).toBeDefined());

    act(() => resultat.result.current.bascule.basculer(true));

    await waitFor(() => expect(resultat.result.current.liste.isError).toBe(true));
    expect(resultat.result.current.bascule.erreur).toBeUndefined();
    expect(resultat.result.current.liste.data?.items[0]?.lu).toBe(true);
    expect(resultat.result.current.liste.error?.message).toBe('Lecture impossible.');
    client.clear();
  });
});
