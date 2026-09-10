import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FondsScreen } from '../../features/books/fonds-screen';

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

const creerReponse = (page: number, total: number, totalPages: number, items = [ouvrage]) =>
  new Response(JSON.stringify({ items, page, limit: 20, total, totalPages }), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe('parcours du fonds', () => {
  it('revient à la dernière page serveur lorsqu’une page disparaît', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(creerReponse(1, 40, 2))
      .mockResolvedValueOnce(creerReponse(2, 20, 1, []))
      .mockResolvedValueOnce(creerReponse(1, 20, 1));
    vi.stubGlobal('fetch', fetchMock);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    render(<FondsScreen />, { wrapper });

    await screen.findByText('Page 1 sur 2 · 40 ouvrages');
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(await screen.findByText('Page 1 sur 1 · 20 ouvrages')).toBeVisible();
  });
});
