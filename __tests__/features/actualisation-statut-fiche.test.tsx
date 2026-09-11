import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8401';
const ouvrage = {
  id: ID,
  titre: 'Bel-Ami',
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

const rendreFiche = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = creerEnveloppeOuvrages(client);
  render(<FicheScreen corriger={vi.fn()} id={ID} retour={vi.fn()} />, { wrapper });
  return client;
};

afterEach(() => vi.unstubAllGlobals());

describe('actualisation après une bascule de lecture', () => {
  it('conserve le statut confirmé lorsque sa relecture échoue', async () => {
    let lectures = 0;
    const ouvrageLu = { ...ouvrage, lu: true, version: 4 };
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      if (initialisation?.method === 'PATCH') {
        return Promise.resolve(new Response(JSON.stringify(ouvrageLu), { status: 200 }));
      }
      lectures += 1;
      return Promise.resolve(
        lectures === 1
          ? new Response(JSON.stringify(ouvrage), { status: 200 })
          : new Response(JSON.stringify({ erreur: 'lecture', message: 'Lecture impossible.' }), {
              status: 400,
            }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('switch', { name: 'Marquer comme lu' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le statut a été enregistré, mais la fiche n’a pas pu être actualisée.',
    );
    expect(screen.getByRole('switch', { name: 'Marquer comme non lu' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Réessayer l’actualisation de la fiche' }),
    ).toBeVisible();
    client.clear();
  });
});
