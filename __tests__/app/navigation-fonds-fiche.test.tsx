import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SuppressionsProvider } from '../../features/books/suppressions-provider';

const routeur = {
  back: vi.fn(),
  canGoBack: vi.fn<() => boolean>(),
  push: vi.fn(),
  replace: vi.fn(),
  setParams: vi.fn(),
};
let parametresRoute: Record<string, string | undefined> = {};

vi.mock('expo-router', () => ({
  useFocusEffect: vi.fn(),
  useLocalSearchParams: () => parametresRoute,
  useRouter: () => routeur,
}));

vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'div' }));

import FondsRoute from '../../app/index';
import FicheRoute from '../../app/ouvrages/[id]';

const ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8401',
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

const creerEnvironnement = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const enveloppe = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <SuppressionsProvider>{children}</SuppressionsProvider>
    </QueryClientProvider>
  );
  return { client, enveloppe };
};

const simulerTransport = () => {
  const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
    const chemin = new URL(String(entree)).pathname;
    if (chemin.endsWith('/notes')) return Promise.resolve(new Response(JSON.stringify([])));
    if (chemin === `/books/${ouvrage.id}`)
      return Promise.resolve(new Response(JSON.stringify(ouvrage)));
    return Promise.resolve(
      new Response(
        JSON.stringify({ items: [ouvrage], page: 3, limit: 20, total: 41, totalPages: 3 }),
      ),
    );
  });
  vi.stubGlobal('fetch', transport);
};

afterEach(() => {
  parametresRoute = {};
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('navigation entre le fonds et une fiche', () => {
  it('transmet la recherche et la page à la fiche puis revient par l’historique', async () => {
    simulerTransport();
    parametresRoute = { page: '3', q: 'zola' };
    const { client, enveloppe } = creerEnvironnement();
    const fonds = render(<FondsRoute />, { wrapper: enveloppe });

    fireEvent.click(await screen.findByRole('button', { name: /^Bel-Ami/ }));
    expect(routeur.push).toHaveBeenCalledWith({
      pathname: '/ouvrages/[id]',
      params: { id: ouvrage.id, retourPage: '3', retourRecherche: 'zola' },
    });
    fonds.unmount();

    parametresRoute = { id: ouvrage.id, retourPage: '3', retourRecherche: 'zola' };
    routeur.canGoBack.mockReturnValue(true);
    render(<FicheRoute />, { wrapper: enveloppe });
    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));

    expect(routeur.back).toHaveBeenCalledOnce();
    expect(routeur.replace).not.toHaveBeenCalled();
    client.clear();
  });

  it('reconstruit les critères de retour lorsque l’historique est absent', () => {
    simulerTransport();
    parametresRoute = { id: ouvrage.id, retourPage: '3', retourRecherche: 'zola' };
    routeur.canGoBack.mockReturnValue(false);
    const { client, enveloppe } = creerEnvironnement();
    render(<FicheRoute />, { wrapper: enveloppe });

    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));

    expect(routeur.replace).toHaveBeenCalledWith({
      pathname: '/',
      params: { page: '3', q: 'zola' },
    });
    client.clear();
  });

  it('revient au fonds initial sans historique ni critères', () => {
    simulerTransport();
    parametresRoute = { id: ouvrage.id };
    routeur.canGoBack.mockReturnValue(false);
    const { client, enveloppe } = creerEnvironnement();
    render(<FicheRoute />, { wrapper: enveloppe });

    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));

    expect(routeur.replace).toHaveBeenCalledWith({
      pathname: '/',
      params: { page: '1', q: '' },
    });
    client.clear();
  });
});
