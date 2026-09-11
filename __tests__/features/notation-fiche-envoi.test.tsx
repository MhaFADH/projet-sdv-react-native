import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Ouvrage, PageOuvrages } from '../../domain/ouvrage';
import { FicheScreen } from '../../features/books/fiche-screen';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { creerEnveloppeOuvrages } from '../outils-rendu';
import { AUTRE_ID, ID, ouvrage, rendreFiche, reponseJson } from './outils-notation';

afterEach(() => vi.unstubAllGlobals());

describe('envoi d’une notation depuis la fiche', () => {
  it('affiche le choix avant la réponse, verrouille cet ouvrage et conserve le succès complet', async () => {
    const confirme = { ...ouvrage, note: 3, version: 4 };
    let confirmerPatch: ((reponse: Response) => void) | undefined;
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') {
        return new Promise<Response>((resoudre) => {
          confirmerPatch = resoudre;
        });
      }
      return Promise.resolve(reponseJson(confirme));
    });
    transport.mockResolvedValueOnce(reponseJson(ouvrage));
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();
    client.setQueryData<PageOuvrages>(clesOuvrages.liste(1), {
      items: [ouvrage],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    fireEvent.click(await screen.findByRole('radio', { name: 'Attribuer 3 étoiles' }));

    expect(screen.getByText('3 sur 5')).toBeVisible();
    for (const commande of screen.getAllByRole('radio')) {
      expect(commande).toHaveAttribute('aria-disabled', 'true');
    }
    expect(screen.getByRole('switch', { name: 'Marquer comme lu' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Attribuer 5 étoiles' }));
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith(
        `http://localhost:3000/books/${ID}`,
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ note: 3 }) }),
      ),
    );
    expect(
      transport.mock.calls.filter(([, initialisation]) => initialisation?.method === 'PATCH'),
    ).toHaveLength(1);

    await act(async () => confirmerPatch?.(reponseJson(confirme)));

    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Attribuer 3 étoiles' })).not.toHaveAttribute(
        'aria-disabled',
      ),
    );
    expect(client.getQueryData<Ouvrage>(clesOuvrages.fiche(ID))).toMatchObject({
      note: 3,
      version: 4,
    });
    expect(client.getQueryData<PageOuvrages>(clesOuvrages.liste(1))?.items[0]).toMatchObject({
      note: 3,
      version: 4,
    });
    expect(client.getQueryState(clesOuvrages.liste(1))?.isInvalidated).toBe(true);
    client.clear();
  });

  it('attribue réellement la valeur zéro sans la confondre avec une absence', async () => {
    const confirme = { ...ouvrage, note: 0, version: 4 };
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') return Promise.resolve(reponseJson(confirme));
      return Promise.resolve(reponseJson(confirme));
    });
    transport.mockResolvedValueOnce(reponseJson(ouvrage));
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.keyDown(await screen.findByRole('radio', { name: 'Attribuer zéro étoile' }), {
      key: ' ',
    });

    expect(screen.getByText('0 sur 5')).toBeVisible();
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith(
        `http://localhost:3000/books/${ID}`,
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ note: 0 }) }),
      ),
    );
    client.clear();
  });

  it('laisse la notation d’un autre ouvrage disponible pendant l’envoi', async () => {
    const autreOuvrage = { ...ouvrage, id: AUTRE_ID, titre: 'Germinal' };
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') return new Promise<Response>(() => undefined);
      return Promise.resolve(
        reponseJson(String(entree).includes(AUTRE_ID) ? autreOuvrage : ouvrage),
      );
    });
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <>
        <FicheScreen corriger={vi.fn()} id={ID} retour={vi.fn()} />
        <FicheScreen corriger={vi.fn()} id={AUTRE_ID} retour={vi.fn()} />
      </>,
      { wrapper: creerEnveloppeOuvrages(client) },
    );

    await waitFor(() =>
      expect(screen.getAllByRole('radio', { name: 'Attribuer 3 étoiles' })).toHaveLength(2),
    );
    const notesTrois = screen.getAllByRole('radio', { name: 'Attribuer 3 étoiles' });
    fireEvent.click(notesTrois[0]);

    expect(notesTrois[0]).toHaveAttribute('aria-disabled', 'true');
    expect(notesTrois[1]).not.toHaveAttribute('aria-disabled');
    fireEvent.click(screen.getAllByRole('radio', { name: 'Attribuer 4 étoiles' })[1]);

    await waitFor(() =>
      expect(
        transport.mock.calls.filter(([, initialisation]) => initialisation?.method === 'PATCH'),
      ).toHaveLength(2),
    );
    expect(
      transport.mock.calls
        .filter(([, initialisation]) => initialisation?.method === 'PATCH')
        .map(([entree]) => String(entree)),
    ).toEqual([`http://localhost:3000/books/${ID}`, `http://localhost:3000/books/${AUTRE_ID}`]);
    client.clear();
  });
});
