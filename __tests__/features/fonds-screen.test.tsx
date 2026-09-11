import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONSULTATION_FONDS_PAR_DEFAUT } from '../../domain/criteres-ouvrages';
import { FondsScreen } from '../../features/books/fonds-screen';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { creerEnveloppeOuvrages } from '../outils-rendu';

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

type FondsControleProps = {
  pageInitiale: number;
  ouvrirOuvrage: (id: string) => void;
};

/** Tient le rôle de la route : la page consultée survit à la navigation. */
const FondsControle = ({ pageInitiale, ouvrirOuvrage }: FondsControleProps) => {
  const [pageDemandee, setPageDemandee] = useState(pageInitiale);
  const changerPage = useCallback((page: number) => setPageDemandee(page), []);
  return (
    <FondsScreen
      ajouterOuvrage={vi.fn()}
      changerConsultation={vi.fn()}
      changerPage={changerPage}
      consultationDemandee={CONSULTATION_FONDS_PAR_DEFAUT}
      ouvrirOuvrage={ouvrirOuvrage}
      pageDemandee={pageDemandee}
    />
  );
};

const rendreFonds = (pageInitiale: number) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = creerEnveloppeOuvrages(client);
  const ouvrirOuvrage = vi.fn();
  render(<FondsControle ouvrirOuvrage={ouvrirOuvrage} pageInitiale={pageInitiale} />, { wrapper });
  return { client, ouvrirOuvrage };
};

afterEach(() => vi.unstubAllGlobals());

describe('parcours du fonds', () => {
  it('revient à la dernière page serveur lorsqu’une page disparaît', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(creerReponse(1, 40, 2))
      .mockResolvedValueOnce(creerReponse(2, 20, 1, []))
      .mockResolvedValueOnce(creerReponse(1, 20, 1));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFonds(1);

    await screen.findByText('Page 1 sur 2 · 40 ouvrages');
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(await screen.findByText('Page 1 sur 1 · 20 ouvrages')).toBeVisible();
    client.clear();
  });

  it("ouvre la fiche de l'ouvrage choisi sans quitter la page consultée", async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(creerReponse(2, 40, 2)));
    const { client, ouvrirOuvrage } = rendreFonds(2);

    fireEvent.click(await screen.findByRole('button', { name: /^Bel-Ami/ }));

    expect(ouvrirOuvrage).toHaveBeenCalledExactlyOnceWith(ouvrage.id);
    expect(screen.getByText('Page 2 sur 2 · 40 ouvrages')).toBeVisible();
    client.clear();
  });

  it('retrouve la page consultée et la réactualise au retour de la fiche', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(creerReponse(2, 40, 2))
      .mockResolvedValueOnce(creerReponse(2, 39, 2));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFonds(2);

    await screen.findByText('Page 2 sur 2 · 40 ouvrages');
    await act(async () => {
      await client.invalidateQueries({ queryKey: clesOuvrages.liste(2) });
    });

    expect(await screen.findByText('Page 2 sur 2 · 39 ouvrages')).toBeVisible();
    client.clear();
  });

  it('affiche la dernière page disponible si la page consultée a disparu pendant la fiche', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(creerReponse(3, 41, 3))
      .mockResolvedValueOnce(creerReponse(3, 20, 1, []))
      .mockResolvedValueOnce(creerReponse(1, 20, 1));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFonds(3);

    await screen.findByText('Page 3 sur 3 · 41 ouvrages');
    await act(async () => {
      await client.invalidateQueries({ queryKey: clesOuvrages.liste(3) });
    });

    expect(await screen.findByText('Page 1 sur 1 · 20 ouvrages')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    client.clear();
  });
});
