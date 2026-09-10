import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBooksPage } from '../../hooks/use-books-page';

const ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
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

const creerPage = (page: number) => ({
  items: [{ ...ouvrage, id: `33575fa9-7968-45b3-8447-ec994a0b840${page}` }],
  page,
  limit: 20,
  total: 40,
  totalPages: 2,
});

const creerReponse = (page: number): Response =>
  new Response(JSON.stringify(creerPage(page)), { status: 200 });

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('consultation paginée des ouvrages', () => {
  it("conserve la page récente lorsqu'une ancienne réponse arrive ensuite", async () => {
    const resolutions: Array<(response: Response) => void> = [];
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolutions.push(resolve);
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result, rerender } = renderHook(({ page }) => useBooksPage(page), {
      initialProps: { page: 1 },
      wrapper,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    rerender({ page: 2 });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => resolutions[1](creerReponse(2)));
    await waitFor(() => expect(result.current.data?.page).toBe(2));
    await act(async () => resolutions[0](creerReponse(1)));

    expect(result.current.data?.page).toBe(2);
    expect(
      client.getQueryCache().find({
        queryKey: ['ouvrages', 'liste', { page: 2, limit: 20, sort: 'titre', order: 'asc' }],
      }),
    ).toBeDefined();
  });

  it('temporise un unique réessai lorsque le service répond 503', async () => {
    const delaiReessaiAttenduMs = 1_000;
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
        status: 503,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new QueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { unmount } = renderHook(() => useBooksPage(1), { wrapper });

    await act(async () => void (await Promise.resolve()));
    expect(fetchMock).toHaveBeenCalledOnce();
    await act(async () => void (await vi.advanceTimersByTimeAsync(delaiReessaiAttenduMs - 1)));
    expect(fetchMock).toHaveBeenCalledOnce();
    await act(async () => void (await vi.advanceTimersByTimeAsync(1)));
    await act(async () => void (await vi.advanceTimersByTimeAsync(delaiReessaiAttenduMs)));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    unmount();
    client.clear();
  });
});
