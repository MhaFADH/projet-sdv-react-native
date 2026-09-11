import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  type ConsultationFonds,
} from '../../domain/criteres-ouvrages';
import type { Ouvrage } from '../../domain/ouvrage';
import { FondsScreen } from '../../features/books/fonds-screen';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const ouvrage: Ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8401',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: false,
  favori: true,
  note: 4,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

const creerReponse = (page: number) =>
  new Response(JSON.stringify({ items: [ouvrage], page, limit: 20, total: 21, totalPages: 2 }), {
    status: 200,
  });

const FondsControle = () => {
  const [page, setPage] = useState(2);
  const [consultation, setConsultation] = useState<ConsultationFonds>({
    ...CONSULTATION_FONDS_PAR_DEFAUT,
    recherche: 'ami',
  });
  const changerConsultation = useCallback((nouvelle: ConsultationFonds) => {
    setConsultation(nouvelle);
    setPage(1);
  }, []);
  return (
    <FondsScreen
      ajouterOuvrage={vi.fn()}
      changerConsultation={changerConsultation}
      changerPage={setPage}
      consultationDemandee={consultation}
      ouvrirOuvrage={vi.fn()}
      ouvrirPreferences={vi.fn()}
      pageDemandee={page}
    />
  );
};

const rendreFonds = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const enveloppe = creerEnveloppeOuvrages(client);
  render(<FondsControle />, { wrapper: enveloppe });
  const filtresCompacts = screen.queryByRole('button', { name: /^Filtres et tri\./ });
  if (filtresCompacts) fireEvent.click(filtresCompacts);
  return client;
};

const derniereUrl = (transport: ReturnType<typeof vi.fn<typeof fetch>>) =>
  new URL(String(transport.mock.calls.at(-1)?.[0]));

afterEach(() => vi.unstubAllGlobals());

describe('filtres et tris du fonds', () => {
  it('combine les critères côté serveur et vide la sélection en revenant à la première page', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const page = Number(new URL(String(entree)).searchParams.get('page'));
      return Promise.resolve(creerReponse(page));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' }));
    const filtreNonLus = screen.getByRole('radio', { name: 'Non lus' });
    filtreNonLus.focus();
    fireEvent.keyDown(filtreNonLus, { key: ' ' });
    fireEvent.click(screen.getByRole('radio', { name: 'Coups de cœur' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Auteur' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Décroissant' }));

    await waitFor(() => {
      expect(Object.fromEntries(derniereUrl(transport).searchParams)).toEqual({
        page: '1',
        limit: '20',
        q: 'ami',
        status: 'nonlu',
        favori: 'true',
        sort: 'auteur',
        order: 'desc',
      });
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('progressbar', { name: 'Chargement des ouvrages' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('radio', { name: 'Non lus' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Coups de cœur' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.queryByRole('button', { name: '0 sélectionnés — Supprimer' }),
    ).not.toBeInTheDocument();
    expect(
      client.getQueryData(
        clesOuvrages.liste(2, { ...CONSULTATION_FONDS_PAR_DEFAUT, recherche: 'ami' }),
      ),
    ).toBeDefined();
    expect(
      client.getQueryData(
        clesOuvrages.liste(1, {
          recherche: 'ami',
          lecture: 'nonlu',
          recommandation: 'favoris',
          tri: 'auteur',
          ordre: 'desc',
        }),
      ),
    ).toBeDefined();
    client.clear();
  });

  it.each([
    ['Titre', 'titre'],
    ['Auteur', 'auteur'],
    ['Année', 'annee'],
    ['Notation', 'note'],
  ] as const)('propose le tri %s dans les deux sens', async (libelle, tri) => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const page = Number(new URL(String(entree)).searchParams.get('page'));
      return Promise.resolve(creerReponse(page));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();

    await screen.findByText('Bel-Ami');
    fireEvent.click(screen.getByRole('radio', { name: libelle }));
    fireEvent.click(screen.getByRole('radio', { name: 'Croissant' }));
    await waitFor(() => {
      expect(derniereUrl(transport).searchParams.get('sort')).toBe(tri);
      expect(derniereUrl(transport).searchParams.get('order')).toBe('asc');
    });

    fireEvent.click(screen.getByRole('radio', { name: 'Décroissant' }));
    await waitFor(() => {
      expect(derniereUrl(transport).searchParams.get('sort')).toBe(tri);
      expect(derniereUrl(transport).searchParams.get('order')).toBe('desc');
    });
    client.clear();
  });
});
