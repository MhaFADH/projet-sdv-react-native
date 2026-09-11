import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONSULTATION_FONDS_PAR_DEFAUT } from '../../domain/criteres-ouvrages';
import type { Ouvrage } from '../../domain/ouvrage';
import { FondsScreen } from '../../features/books/fonds-screen';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const creerOuvrage = (id: string, titre: string, auteur: string): Ouvrage => ({
  id,
  titre,
  auteur,
  editeur: 'Éditeur',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 1,
});

const belAmi = creerOuvrage('33575fa9-7968-45b3-8447-ec994a0b8401', 'Bel-Ami', 'Guy de Maupassant');
const germinal = creerOuvrage('33575fa9-7968-45b3-8447-ec994a0b8402', 'Germinal', 'Émile Zola');
const ouvrirOuvrage = vi.fn();

const creerReponse = (
  ouvrages: Ouvrage[],
  page = 1,
  total = ouvrages.length,
  nombreTotalPages = 1,
) =>
  new Response(
    JSON.stringify({ items: ouvrages, page, limit: 20, total, totalPages: nombreTotalPages }),
    { status: 200 },
  );

type ProprietesFondsControle = {
  pageInitiale?: number;
  rechercheInitiale?: string;
};

const FondsControle = ({ pageInitiale = 1, rechercheInitiale = '' }: ProprietesFondsControle) => {
  const [page, setPage] = useState(pageInitiale);
  const consultationInitiale = { ...CONSULTATION_FONDS_PAR_DEFAUT, recherche: rechercheInitiale };
  const [consultation, setConsultation] = useState(consultationInitiale);
  const changerPage = useCallback((nouvellePage: number) => setPage(nouvellePage), []);
  const changerConsultation = useCallback((nouvelleConsultation: typeof consultationInitiale) => {
    setConsultation(nouvelleConsultation);
    setPage(1);
  }, []);
  return (
    <FondsScreen
      ajouterOuvrage={vi.fn()}
      changerConsultation={changerConsultation}
      changerPage={changerPage}
      consultationDemandee={consultation}
      ouvrirOuvrage={ouvrirOuvrage}
      ouvrirPreferences={vi.fn()}
      pageDemandee={page}
    />
  );
};

const rendreFonds = (proprietes: ProprietesFondsControle = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const enveloppe = creerEnveloppeOuvrages(client);
  render(<FondsControle {...proprietes} />, { wrapper: enveloppe });
  return client;
};

const lireUrl = (transport: ReturnType<typeof vi.fn<typeof fetch>>, index: number) =>
  new URL(String(transport.mock.calls[index][0]));

const changerSaisie = (valeur: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: 'Rechercher un titre ou un auteur' }), {
    target: { value: valeur },
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

describe('recherche dans le fonds', () => {
  it('attend 300 ms après la dernière frappe et envoie les critères fixes au serveur', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const q = new URL(String(entree)).searchParams.get('q');
      return Promise.resolve(creerReponse(q === 'zola' ? [germinal] : [belAmi, germinal]));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();
    await screen.findByText('Bel-Ami');
    vi.useFakeTimers();

    changerSaisie('zo');
    await act(async () => void (await vi.advanceTimersByTimeAsync(200)));
    changerSaisie('zola');
    await act(async () => void (await vi.advanceTimersByTimeAsync(299)));
    expect(transport).toHaveBeenCalledOnce();
    expect(screen.getByText('Bel-Ami')).toBeVisible();

    await act(async () => void (await vi.advanceTimersByTimeAsync(1)));
    await attendreMicrotaches();
    expect(transport).toHaveBeenCalledTimes(2);
    const url = lireUrl(transport, 1);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: '1',
      limit: '20',
      q: 'zola',
      sort: 'titre',
      order: 'asc',
    });
    await attendreMicrotaches();
    expect(screen.getByText('Germinal')).toBeVisible();
    expect(screen.queryByText('Bel-Ami')).not.toBeInTheDocument();
    client.clear();
  });

  it('annule la recherche dépassée et ignore sa réponse arrivée en dernier', async () => {
    const enAttente: Array<{
      q: string;
      signal: AbortSignal;
      resoudre: (reponse: Response) => void;
    }> = [];
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      const q = new URL(String(entree)).searchParams.get('q') ?? '';
      if (q === '') return Promise.resolve(creerReponse([belAmi, germinal]));
      return new Promise<Response>((resoudre) => {
        if (initialisation?.signal) enAttente.push({ q, signal: initialisation.signal, resoudre });
      });
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();
    await screen.findByText('Bel-Ami');
    vi.useFakeTimers();

    changerSaisie('zola');
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(enAttente).toHaveLength(1);
    changerSaisie('hugo');
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(enAttente).toHaveLength(2);

    expect(enAttente[0].signal.aborted).toBe(true);
    await act(async () => enAttente[1].resoudre(creerReponse([belAmi])));
    await attendreMicrotaches();
    expect(screen.getByText('Bel-Ami')).toBeVisible();
    await act(async () => enAttente[0].resoudre(creerReponse([germinal])));
    expect(screen.queryByText('Germinal')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    client.clear();
  });

  it('vide la sélection à l’application puis restaure le fonds après effacement', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const q = new URL(String(entree)).searchParams.get('q');
      return Promise.resolve(creerReponse(q === 'zola' ? [germinal] : [belAmi, germinal]));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' }));
    expect(screen.getByRole('button', { name: '1 sélectionné — Supprimer' })).toBeEnabled();
    vi.useFakeTimers();

    changerSaisie('zola');
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(screen.getByText('Germinal')).toBeVisible();
    expect(screen.queryByLabelText('0 sélectionnés — Supprimer')).not.toBeInTheDocument();

    changerSaisie('');
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();
    expect(screen.getByText('Bel-Ami')).toBeVisible();
    expect(lireUrl(transport, 2).searchParams.has('q')).toBe(false);
    client.clear();
  });

  it('revient à la première page quand la recherche est appliquée', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const url = new URL(String(entree));
      const page = Number(url.searchParams.get('page'));
      const rechercheActive = url.searchParams.has('q');
      return Promise.resolve(creerReponse(rechercheActive ? [germinal] : [belAmi], page, 40, 2));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds({ pageInitiale: 2 });
    await screen.findByText('Bel-Ami');
    vi.useFakeTimers();

    changerSaisie('zola');
    await act(async () => void (await vi.advanceTimersByTimeAsync(300)));
    await attendreMicrotaches();

    expect(lireUrl(transport, 1).searchParams.get('page')).toBe('1');
    expect(screen.getByText('Page 1 sur 2 · 40 ouvrages')).toBeVisible();
    client.clear();
  });

  it('conserve la liste pendant le chargement distinct d’une autre page', async () => {
    let resoudrePageDeux: ((reponse: Response) => void) | undefined;
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const page = new URL(String(entree)).searchParams.get('page');
      if (page === '1') return Promise.resolve(creerReponse([belAmi], 1, 21, 2));
      return new Promise<Response>((resoudre) => {
        resoudrePageDeux = resoudre;
      });
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();
    const caseAnciennePage = await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' });
    fireEvent.click(caseAnciennePage);
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    expect(
      await screen.findByRole('progressbar', { name: 'Chargement de la page 2' }),
    ).toBeVisible();
    expect(caseAnciennePage).toHaveAttribute('aria-disabled', 'true');
    const carteAnciennePage = screen.getByRole('button', { name: /^Bel-Ami/ });
    expect(carteAnciennePage).toBeDisabled();
    fireEvent.click(carteAnciennePage);
    expect(ouvrirOuvrage).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('0 sélectionnés — Supprimer')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Précédent' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeEnabled();
    fireEvent.click(caseAnciennePage);
    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(transport).toHaveBeenCalledTimes(2);
    await act(async () => resoudrePageDeux?.(creerReponse([germinal], 2, 21, 2)));

    expect(await screen.findByText('Germinal')).toBeVisible();
    client.clear();
  });
});
