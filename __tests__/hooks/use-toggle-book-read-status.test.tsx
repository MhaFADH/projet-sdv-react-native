import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PageOuvrages } from '../../domain/ouvrage';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { useToggleBookReadStatus } from '../../hooks/use-toggle-book-read-status';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';
const ouvrage = {
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

const creerEnvironnement = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(clesOuvrages.fiche(ID), ouvrage);
  client.setQueryData<PageOuvrages>(clesOuvrages.liste(1), {
    items: [ouvrage],
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

const lireLuFiche = (client: QueryClient) =>
  client.getQueryData<typeof ouvrage>(clesOuvrages.fiche(ID))?.lu;

const lireLuListe = (client: QueryClient) =>
  client.getQueryData<PageOuvrages>(clesOuvrages.liste(1))?.items[0]?.lu;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('bascule du statut de lecture', () => {
  it('actualise immédiatement fiche et liste puis conserve la réponse confirmée', async () => {
    let terminerPatch: ((reponse: Response) => void) | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            terminerPatch = resolve;
          }),
      ),
    );
    const { client, wrapper } = creerEnvironnement();
    const { result } = renderHook(() => useToggleBookReadStatus(ID), { wrapper });

    act(() => result.current.basculer(true));

    await waitFor(() => expect(lireLuFiche(client)).toBe(true));
    expect(lireLuListe(client)).toBe(true);
    expect(result.current.enCours).toBe(true);

    await act(async () =>
      terminerPatch?.(
        new Response(
          JSON.stringify({
            ...ouvrage,
            lu: true,
            version: 4,
            updatedAt: '2025-01-03T10:00:00.000Z',
          }),
          { status: 200 },
        ),
      ),
    );

    await waitFor(() => expect(result.current.enCours).toBe(false));
    expect(client.getQueryData(clesOuvrages.fiche(ID))).toMatchObject({
      lu: true,
      version: 4,
      titre: 'Bel-Ami',
    });
    expect(lireLuListe(client)).toBe(true);
    expect(client.getQueryState(clesOuvrages.fiche(ID))?.isInvalidated).toBe(true);
    expect(client.getQueryState(clesOuvrages.liste(1))?.isInvalidated).toBe(true);
  });

  it('restaure les caches après un refus et permet de réessayer', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ erreur: 'invalide', message: 'Modification refusée.' }), {
          status: 422,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...ouvrage, lu: true, version: 4 }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const { client, wrapper } = creerEnvironnement();
    const { result } = renderHook(() => useToggleBookReadStatus(ID), { wrapper });

    act(() => result.current.basculer(true));

    await waitFor(() => expect(result.current.erreur).toBeDefined());
    expect(lireLuFiche(client)).toBe(false);
    expect(lireLuListe(client)).toBe(false);
    expect(result.current.erreur?.message).toContain('Le statut précédent a été restauré.');

    act(() => result.current.erreur?.reessayer());

    await waitFor(() => expect(lireLuFiche(client)).toBe(true));
    await waitFor(() => expect(result.current.enCours).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('temporise un unique réessai automatique après une réponse 503', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
        status: 503,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { wrapper } = creerEnvironnement();
    const { result } = renderHook(() => useToggleBookReadStatus(ID), { wrapper });

    act(() => result.current.basculer(true));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fetchMock).toHaveBeenCalledOnce();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), { timeout: 2_000 });
    await waitFor(() => expect(result.current.erreur).toBeDefined());
  });

  it("ignore une réponse ancienne lorsqu'une intention plus récente existe", async () => {
    const resolutions: Array<(reponse: Response) => void> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolutions.push(resolve);
          }),
      ),
    );
    const { client, wrapper } = creerEnvironnement();
    const { result } = renderHook(() => useToggleBookReadStatus(ID), { wrapper });

    act(() => {
      result.current.basculer(true);
      result.current.basculer(false);
    });
    await waitFor(() => expect(resolutions).toHaveLength(2));
    await act(async () =>
      resolutions[1](
        new Response(JSON.stringify({ ...ouvrage, lu: false, version: 5 }), { status: 200 }),
      ),
    );
    await act(async () =>
      resolutions[0](
        new Response(JSON.stringify({ ...ouvrage, lu: true, version: 4 }), { status: 200 }),
      ),
    );

    expect(lireLuFiche(client)).toBe(false);
    expect(lireLuListe(client)).toBe(false);
  });
});
