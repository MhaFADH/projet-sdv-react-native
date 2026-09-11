import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8401';
const SECOND_ID = '33575fa9-7968-45b3-8447-ec994a0b8402';

const ouvrage = {
  id: ID,
  titre: 'Bel Ami & compagnie',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

const secondOuvrage = { ...ouvrage, id: SECOND_ID, titre: 'Germinal' };

const appelsOpenLibrary = (transport: ReturnType<typeof vi.fn<typeof fetch>>) =>
  transport.mock.calls.filter(([entree]) => String(entree).startsWith('https://openlibrary.org/'));

const rendreFiche = (client: QueryClient) =>
  render(<FicheScreen corriger={vi.fn()} id={ID} retour={vi.fn()} />, {
    wrapper: creerEnveloppeOuvrages(client),
  });

const creerTransport = (repondreOpenLibrary: () => Promise<Response>) =>
  vi.fn<typeof fetch>().mockImplementation((entree) => {
    const url = String(entree);
    if (url.startsWith('https://openlibrary.org/')) return repondreOpenLibrary();
    return Promise.resolve(
      new Response(JSON.stringify(url.endsWith('/notes') ? [] : ouvrage), { status: 200 }),
    );
  });

const attendreMicrotaches = async () => {
  await act(async () => {
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
    await vi.advanceTimersByTimeAsync(0);
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
  });
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('enrichissement OpenLibrary de la fiche', () => {
  it('attend 300 ms puis affiche le nombre d’éditions et la première année', async () => {
    const transport = creerTransport(() =>
      Promise.resolve(
        new Response(JSON.stringify({ numFound: 27, docs: [{ first_publish_year: 1885 }] }), {
          status: 200,
        }),
      ),
    );
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    rendreFiche(client);
    vi.useFakeTimers();
    await attendreMicrotaches();

    expect(screen.getByRole('heading', { name: 'Bel Ami & compagnie' })).toBeVisible();
    expect(appelsOpenLibrary(transport)).toHaveLength(0);
    await act(async () => void (await vi.advanceTimersByTimeAsync(299)));
    expect(appelsOpenLibrary(transport)).toHaveLength(0);

    await act(async () => void (await vi.advanceTimersByTimeAsync(1)));
    await attendreMicrotaches();

    expect(screen.getByRole('heading', { name: 'Données OpenLibrary' })).toBeVisible();
    expect(screen.getByText('27 éditions référencées')).toBeVisible();
    expect(screen.getByText(/Première publication : 1.885/)).toBeVisible();
    expect(appelsOpenLibrary(transport)).toHaveLength(1);
    client.clear();
  });

  it('affiche zéro édition sans inventer une année ni signaler un échec', async () => {
    const transport = creerTransport(() =>
      Promise.resolve(new Response(JSON.stringify({ numFound: 0, docs: [] }), { status: 200 })),
    );
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    rendreFiche(client);
    vi.useFakeTimers();
    await attendreMicrotaches();

    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();

    expect(screen.getByText('0 édition référencée')).toBeVisible();
    expect(screen.queryByText(/Première publication/)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    client.clear();
  });

  it('confine une panne à la section secondaire et laisse les actions utilisables', async () => {
    const transport = creerTransport(() =>
      Promise.resolve(new Response(JSON.stringify({ erreur: 'indisponible' }), { status: 503 })),
    );
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    rendreFiche(client);
    vi.useFakeTimers();
    await attendreMicrotaches();

    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();

    expect(screen.queryByRole('heading', { name: 'Données OpenLibrary' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Corriger cet ouvrage' })).toBeEnabled();
    expect(screen.getByRole('switch', { name: 'Marquer comme lu' })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Note de lecture' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    client.clear();
  });

  it('réutilise son cache frais et conserve la donnée devenue périmée pendant une panne', async () => {
    let panne = false;
    const transport = creerTransport(() =>
      Promise.resolve(
        panne
          ? new Response(JSON.stringify({ erreur: 'indisponible' }), { status: 503 })
          : new Response(JSON.stringify({ numFound: 12, docs: [] }), { status: 200 }),
      ),
    );
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const premiereVue = rendreFiche(client);
    vi.useFakeTimers();
    await attendreMicrotaches();
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(screen.getByText('12 éditions référencées')).toBeVisible();
    premiereVue.unmount();

    const vueDepuisCache = rendreFiche(client);
    await attendreMicrotaches();
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(screen.getByText('12 éditions référencées')).toBeVisible();
    expect(appelsOpenLibrary(transport)).toHaveLength(1);
    vueDepuisCache.unmount();

    panne = true;
    await act(async () => void (await vi.advanceTimersByTimeAsync(5 * 60 * 1_000 + 1)));
    rendreFiche(client);
    await attendreMicrotaches();
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();

    expect(appelsOpenLibrary(transport)).toHaveLength(2);
    expect(screen.getByText('12 éditions référencées')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    client.clear();
  });

  it('annule l’ancien titre et ignore sa réponse arrivée après la nouvelle', async () => {
    const recherches: Array<{
      titre: string;
      signal: AbortSignal;
      resoudre: (reponse: Response) => void;
    }> = [];
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      const url = String(entree);
      if (url.startsWith('https://openlibrary.org/')) {
        return new Promise<Response>((resoudre) => {
          if (initialisation?.signal) {
            recherches.push({
              titre: new URL(url).searchParams.get('title') ?? '',
              signal: initialisation.signal,
              resoudre,
            });
          }
        });
      }
      if (url.endsWith('/notes')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      return Promise.resolve(
        new Response(JSON.stringify(url.endsWith(SECOND_ID) ? secondOuvrage : ouvrage), {
          status: 200,
        }),
      );
    });
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const vue = rendreFiche(client);
    vi.useFakeTimers();
    await attendreMicrotaches();
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(recherches).toHaveLength(1);

    vue.rerender(<FicheScreen corriger={vi.fn()} id={SECOND_ID} retour={vi.fn()} />);
    await attendreMicrotaches();

    expect(screen.getByRole('heading', { name: 'Germinal' })).toBeVisible();
    expect(recherches[0].signal.aborted).toBe(true);
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(recherches.map(({ titre }) => titre)).toEqual(['Bel Ami & compagnie', 'Germinal']);

    await act(async () =>
      recherches[1].resoudre(
        new Response(JSON.stringify({ numFound: 2, docs: [] }), { status: 200 }),
      ),
    );
    await attendreMicrotaches();
    expect(screen.getByText('2 éditions référencées')).toBeVisible();

    await act(async () =>
      recherches[0].resoudre(
        new Response(JSON.stringify({ numFound: 99, docs: [] }), { status: 200 }),
      ),
    );
    await attendreMicrotaches();

    expect(screen.getByText('2 éditions référencées')).toBeVisible();
    expect(screen.queryByText('99 éditions référencées')).not.toBeInTheDocument();
    client.clear();
  });
});
