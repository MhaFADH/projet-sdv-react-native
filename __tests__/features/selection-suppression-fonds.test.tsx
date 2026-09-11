import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONSULTATION_FONDS_PAR_DEFAUT } from '../../domain/criteres-ouvrages';
import type { Ouvrage } from '../../domain/ouvrage';
import { FondsScreen } from '../../features/books/fonds-screen';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const ID_BEL_AMI = '33575fa9-7968-45b3-8447-ec994a0b8401';
const ID_GERMINAL = '33575fa9-7968-45b3-8447-ec994a0b8402';
const ID_ASSOMMOIR = '33575fa9-7968-45b3-8447-ec994a0b8403';

const creerOuvrage = (id: string, titre: string): Ouvrage => ({
  id,
  titre,
  auteur: 'Auteur',
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

const belAmi = creerOuvrage(ID_BEL_AMI, 'Bel-Ami');
const germinal = creerOuvrage(ID_GERMINAL, 'Germinal');
const assommoir = creerOuvrage(ID_ASSOMMOIR, 'L’Assommoir');
const ouvrages = [belAmi, germinal, assommoir];

const creerReponsePage = (items: Ouvrage[], page = 1, total = items.length, totalPages = 1) =>
  new Response(JSON.stringify({ items, page, limit: 20, total, totalPages }), { status: 200 });

const lirePage = (entree: RequestInfo | URL): number =>
  Number(new URL(String(entree)).searchParams.get('page'));

const attendreMicrotaches = async () => {
  for (let index = 0; index < 10; index += 1) await Promise.resolve();
};

type ProprietesFondsControle = {
  pageInitiale?: number;
};

const FondsControle = ({ pageInitiale = 1 }: ProprietesFondsControle) => {
  const [page, setPage] = useState(pageInitiale);
  const changerPage = useCallback((nouvellePage: number) => setPage(nouvellePage), []);
  return (
    <FondsScreen
      ajouterOuvrage={vi.fn()}
      changerConsultation={vi.fn()}
      changerPage={changerPage}
      consultationDemandee={CONSULTATION_FONDS_PAR_DEFAUT}
      ouvrirOuvrage={vi.fn()}
      ouvrirPreferences={vi.fn()}
      pageDemandee={page}
    />
  );
};

const rendreFonds = (pageInitiale = 1) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const enveloppe = creerEnveloppeOuvrages(client);
  render(<FondsControle pageInitiale={pageInitiale} />, { wrapper: enveloppe });
  return client;
};

const ouvrirConfirmation = (nombre: number) => {
  fireEvent.click(
    screen.getByRole('button', {
      name: `${nombre} sélectionné${nombre > 1 ? 's' : ''} — Supprimer`,
    }),
  );
  return screen.getByRole('dialog', { name: 'Confirmation de suppression' });
};

const confirmer = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));

const appelsDelete = (transport: ReturnType<typeof vi.fn<typeof fetch>>) =>
  transport.mock.calls.filter(([, initialisation]) => initialisation?.method === 'DELETE');

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('sélection et suppression depuis le fonds', () => {
  it('limite la sélection à la page affichée et la remet à zéro à chaque changement de page', async () => {
    const transport = vi
      .fn<typeof fetch>()
      .mockImplementation((entree) =>
        Promise.resolve(
          lirePage(entree) === 2
            ? creerReponsePage([assommoir], 2, 3, 2)
            : creerReponsePage([belAmi, germinal], 1, 3, 2),
        ),
      );
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();

    const caseBelAmi = await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' });
    caseBelAmi.focus();
    fireEvent.keyDown(caseBelAmi, { key: ' ' });
    fireEvent.keyUp(caseBelAmi, { key: ' ' });
    expect(screen.getByRole('button', { name: '1 sélectionné — Supprimer' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    expect(await screen.findByText('Page 2 sur 2 · 3 ouvrages')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Sélectionner L’Assommoir' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(
      screen.queryByRole('button', { name: '0 sélectionnés — Supprimer' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }));

    await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' });
    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'Sélectionner Bel-Ami' })).toHaveAttribute(
        'aria-checked',
        'false',
      ),
    );
    client.clear();
  });

  it('n’agit pas après un abandon puis agrège et annule toutes les sélections confirmées', async () => {
    const transport = vi.fn<typeof fetch>().mockResolvedValue(creerReponsePage(ouvrages));
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' }));
    vi.useFakeTimers({ now: 0 });

    expect(ouvrirConfirmation(1)).toHaveTextContent('Bel-Ami');
    fireEvent.click(screen.getByRole('button', { name: 'Renoncer à la suppression' }));
    await act(async () => void (await vi.advanceTimersByTimeAsync(5_001)));
    expect(appelsDelete(transport)).toHaveLength(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    ouvrirConfirmation(1);
    confirmer();
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 5 s');
    await act(async () => void (await vi.advanceTimersByTimeAsync(1_000)));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sélectionner Germinal' }));
    expect(ouvrirConfirmation(1)).toHaveTextContent('Germinal');
    confirmer();

    expect(screen.getByRole('alert')).toHaveTextContent('2 ouvrages à supprimer dans 5 s');
    await act(async () => void (await vi.advanceTimersByTimeAsync(4_000)));
    expect(appelsDelete(transport)).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Annuler toutes les suppressions' }));
    await act(async () => void (await vi.advanceTimersByTimeAsync(1_000)));

    expect(screen.getByRole('checkbox', { name: 'Sélectionner Bel-Ami' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Sélectionner Germinal' })).toBeVisible();
    expect(appelsDelete(transport)).toHaveLength(0);
    client.clear();
  });

  it('bloque l’action pendant l’envoi et ne réessaie que les échecs partiels', async () => {
    const suppressions: Array<{ id: string; terminer: (reponse: Response) => void }> = [];
    const supprimes = new Set<string>();
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      const id = String(entree).split('/').at(-1) ?? '';
      if (initialisation?.method === 'DELETE') {
        return new Promise<Response>((terminer) => suppressions.push({ id, terminer }));
      }
      return Promise.resolve(creerReponsePage(ouvrages.filter(({ id }) => !supprimes.has(id))));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFonds();

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Sélectionner Bel-Ami' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sélectionner Germinal' }));
    vi.useFakeTimers({ now: 0 });
    const dialogue = ouvrirConfirmation(2);
    expect(dialogue).toHaveTextContent('Bel-Ami');
    expect(dialogue).toHaveTextContent('Germinal');
    confirmer();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sélectionner L’Assommoir' }));
    await act(async () => void (await vi.advanceTimersByTimeAsync(5_000)));

    expect(suppressions).toHaveLength(2);
    expect(screen.getByRole('button', { name: '1 sélectionné — Supprimer' })).toBeDisabled();
    supprimes.add(ID_BEL_AMI);
    await act(async () => {
      suppressions[0].terminer(new Response(null, { status: 204 }));
      suppressions[1].terminer(
        new Response(JSON.stringify({ erreur: 'chaos', message: 'Indisponible.' }), {
          status: 503,
        }),
      );
      await attendreMicrotaches();
    });

    expect(
      screen.queryByRole('checkbox', { name: 'Sélectionner Bel-Ami' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Sélectionner Germinal' })).toBeVisible();
    expect(screen.getByRole('button', { name: '1 sélectionné — Supprimer' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer la suppression de 1 ouvrage' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Germinal');
    expect(screen.getByRole('dialog')).not.toHaveTextContent('Bel-Ami');
    confirmer();
    await act(async () => void (await vi.advanceTimersByTimeAsync(5_000)));
    expect(suppressions).toHaveLength(3);

    supprimes.add(ID_GERMINAL);
    await act(async () => {
      suppressions[2].terminer(new Response(null, { status: 204 }));
      await attendreMicrotaches();
    });
    const urls = appelsDelete(transport).map(([entree]) => String(entree));
    expect(urls.filter((url) => url.endsWith(ID_BEL_AMI))).toHaveLength(1);
    expect(urls.filter((url) => url.endsWith(ID_GERMINAL))).toHaveLength(2);
    client.clear();
  });
});
