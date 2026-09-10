import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { useBook } from '../../hooks/use-book';

const PREMIER_ID = '33575fa9-7968-45b3-8447-ec994a0b8401';
const SECOND_ID = '33575fa9-7968-45b3-8447-ec994a0b8402';

const ouvrage = {
  id: PREMIER_ID,
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: true,
  favori: false,
  note: 4,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

const creerReponse = (id: string, titre: string): Response =>
  new Response(JSON.stringify({ ...ouvrage, id, titre }), { status: 200 });

const creerEnvironnement = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

afterEach(() => vi.unstubAllGlobals());

describe('consultation d’une fiche', () => {
  it('mémorise chaque fiche sous une clé distincte des listes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(creerReponse(PREMIER_ID, 'Bel-Ami')),
    );
    const { client, wrapper } = creerEnvironnement();

    const { result } = renderHook(() => useBook(PREMIER_ID), { wrapper });

    await waitFor(() => expect(result.current.data?.titre).toBe('Bel-Ami'));
    expect(client.getQueryData(clesOuvrages.fiche(PREMIER_ID))).toMatchObject({
      id: PREMIER_ID,
      version: 3,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z',
      favori: false,
      note: 4,
    });
    expect(client.getQueryData(clesOuvrages.liste(1))).toBeUndefined();
  });

  it("conserve la fiche courante lorsqu'une réponse plus ancienne arrive ensuite", async () => {
    const resolutions: Array<(reponse: Response) => void> = [];
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolutions.push(resolve);
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { wrapper } = creerEnvironnement();

    const { result, rerender } = renderHook(({ id }) => useBook(id), {
      initialProps: { id: PREMIER_ID },
      wrapper,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    rerender({ id: SECOND_ID });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => resolutions[1](creerReponse(SECOND_ID, 'Germinal')));
    await waitFor(() => expect(result.current.data?.id).toBe(SECOND_ID));
    await act(async () => resolutions[0](creerReponse(PREMIER_ID, 'Bel-Ami')));

    expect(result.current.data?.id).toBe(SECOND_ID);
    expect(result.current.data?.titre).toBe('Germinal');
  });

  it('annule la requête devenue inutile lors d’un changement rapide de fiche', async () => {
    const signaux: Array<AbortSignal | null | undefined> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
        signaux.push(initialisation?.signal);
        return new Promise((_resolve, reject) => {
          initialisation?.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
        });
      }),
    );
    const { wrapper } = creerEnvironnement();

    const { rerender } = renderHook(({ id }) => useBook(id), {
      initialProps: { id: PREMIER_ID },
      wrapper,
    });

    await waitFor(() => expect(signaux).toHaveLength(1));
    rerender({ id: SECOND_ID });

    await waitFor(() => expect(signaux[0]?.aborted).toBe(true));
    expect(signaux[1]?.aborted).toBe(false);
  });

  it('expose une absence de fiche sans réessai automatique', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'introuvable', message: 'Livre inconnu.' }), {
        status: 404,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new QueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBook(PREMIER_ID), { wrapper });

    await waitFor(() => expect(result.current.error?.type).toBe('introuvable'));
    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
    client.clear();
  });
});
