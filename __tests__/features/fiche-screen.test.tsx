import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import { SuppressionsProvider } from '../../features/books/suppressions-provider';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8401';
const DELAI_ATTENTE_REESSAI_MS = 3_000;

const ouvrage = {
  id: ID,
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: '',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

const rendreFiche = (identifiant = ID) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <SuppressionsProvider>{children}</SuppressionsProvider>
    </QueryClientProvider>
  );
  const retour = vi.fn();
  render(<FicheScreen corriger={vi.fn()} id={identifiant} retour={retour} />, { wrapper });
  return { client, retour };
};

afterEach(() => vi.unstubAllGlobals());

describe('parcours de la fiche', () => {
  it("ouvre la fiche correspondant à l'identifiant demandé", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrage), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const { client } = rendreFiche();

    expect(screen.getByRole('progressbar', { name: 'Chargement de la fiche' })).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    expect(screen.getByText('Éditeur non renseigné')).toBeVisible();
    expect(screen.getByText('1885')).toBeVisible();
    expect(screen.getByText('Non lu')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID}`,
      expect.objectContaining({ method: 'GET' }),
    );
    client.clear();
  });

  it("n'affiche ni chargement infini ni fiche fictive lorsque le serveur répond 404", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ erreur: 'introuvable', message: 'Livre inconnu.' }), {
          status: 404,
        }),
      ),
    );

    const { client } = rendreFiche();

    expect(
      await screen.findByRole('heading', { name: "Cette fiche n'est plus disponible" }),
    ).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Réessayer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retour au fonds' })).toBeVisible();
    client.clear();
  });

  it('propose un réessai manuel après un échec réseau persistant', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify(ouvrage), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const { client } = rendreFiche();

    const boutonReessayer = await screen.findByRole(
      'button',
      { name: 'Réessayer' },
      { timeout: DELAI_ATTENTE_REESSAI_MS },
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Le serveur est injoignable.');
    fireEvent.click(boutonReessayer);

    expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    client.clear();
  });

  it('bascule immédiatement le statut puis affiche la réponse confirmée', async () => {
    let terminerPatch: ((reponse: Response) => void) | undefined;
    let nombreLectures = 0;
    const ouvrageLu = { ...ouvrage, lu: true, version: 4 };
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
      if (initialisation?.method === 'PATCH') {
        return new Promise<Response>((resolve) => {
          terminerPatch = resolve;
        });
      }
      nombreLectures += 1;
      return Promise.resolve(
        new Response(JSON.stringify(nombreLectures === 1 ? ouvrage : ouvrageLu), { status: 200 }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFiche();

    const bascule = await screen.findByRole('switch', { name: 'Marquer comme lu' });
    fireEvent.click(bascule);

    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Marquer comme non lu' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
    expect(
      screen.getByRole('progressbar', { name: 'Enregistrement du statut en cours' }),
    ).toBeVisible();
    const appelPatch = fetchMock.mock.calls.find((appel) => appel[1]?.method === 'PATCH');
    expect(appelPatch).toEqual([
      `http://localhost:3000/books/${ID}`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ lu: true }) }),
    ]);

    await act(async () =>
      terminerPatch?.(new Response(JSON.stringify(ouvrageLu), { status: 200 })),
    );
    await waitFor(() => expect(nombreLectures).toBe(2));
    expect(screen.getByText('Lu')).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    client.clear();
  });

  it('restaure le statut après un refus puis réessaie à la demande', async () => {
    let nombrePatchs = 0;
    let nombreLectures = 0;
    const ouvrageLu = { ...ouvrage, lu: true, version: 4 };
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
      if (initialisation?.method === 'PATCH') {
        nombrePatchs += 1;
        return Promise.resolve(
          nombrePatchs === 1
            ? new Response(JSON.stringify({ erreur: 'refus', message: 'Modification refusée.' }), {
                status: 422,
              })
            : new Response(JSON.stringify(ouvrageLu), { status: 200 }),
        );
      }
      nombreLectures += 1;
      return Promise.resolve(
        new Response(JSON.stringify(nombreLectures === 1 ? ouvrage : ouvrageLu), { status: 200 }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFiche();

    fireEvent.click(await screen.findByRole('switch', { name: 'Marquer comme lu' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le statut précédent a été restauré. Modification refusée.',
    );
    expect(screen.getByText('Non lu')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer la modification du statut' }));

    await waitFor(() => expect(nombrePatchs).toBe(2));
    await waitFor(() => expect(nombreLectures).toBe(2));
    expect(screen.getByRole('switch', { name: 'Marquer comme non lu' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    client.clear();
  });

  it('traite un identifiant de route absent comme une absence, sans interroger le serveur', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    const { client } = rendreFiche('');

    expect(
      await screen.findByRole('heading', { name: "Cette fiche n'est plus disponible" }),
    ).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    client.clear();
  });
});
