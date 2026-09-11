import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import { clesNotes } from '../../hooks/cles-notes';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const PREMIER_ID = '33575fa9-7968-45b3-8447-ec994a0b8401';
const SECOND_ID = '33575fa9-7968-45b3-8447-ec994a0b8402';
const DELAI_ATTENTE_REESSAI_MS = 3_000;

const ouvrage = {
  id: PREMIER_ID,
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

const notes = [
  {
    id: 'b248b48c-8df4-4883-8a23-6f53b3145ec9',
    livreId: PREMIER_ID,
    contenu: 'Observation récente.',
    createdAt: '2025-01-02T10:30:00',
  },
  {
    id: '03c36090-9281-40c4-8cf2-4e36c18304c6',
    livreId: PREMIER_ID,
    contenu: 'Observation ancienne.',
    createdAt: '2025-01-01T09:15:00',
  },
];

const rendreFiche = (id = PREMIER_ID) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = creerEnveloppeOuvrages(client);
  const vue = render(<FicheScreen corriger={vi.fn()} id={id} retour={vi.fn()} />, { wrapper });
  return { client, ...vue };
};

const reponseJson = (corps: unknown, statut = 200): Promise<Response> =>
  Promise.resolve(new Response(JSON.stringify(corps), { status: statut }));

const transportFicheEtNotes = (corpsNotes: unknown) =>
  vi
    .fn<typeof fetch>()
    .mockImplementation((entree) =>
      String(entree).endsWith('/notes') ? reponseJson(corpsNotes) : reponseJson(ouvrage),
    );

afterEach(() => vi.unstubAllGlobals());

describe('consultation des notes sur la fiche', () => {
  it('affiche les notes dans l’ordre serveur avec leur date et leur heure françaises', async () => {
    const fetchMock = transportFicheEtNotes(notes);
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFiche();

    expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'Chargement des notes de Bel-Ami' }),
    ).toBeVisible();
    const liste = await screen.findByRole('list', { name: 'Notes de lecture de Bel-Ami' });
    const elements = within(liste).getAllByRole('listitem');

    expect(elements).toHaveLength(2);
    expect(elements[0]).toHaveTextContent('Observation récente.');
    expect(elements[0]).toHaveTextContent('2 janvier 2025 à 10:30');
    expect(elements[1]).toHaveTextContent('Observation ancienne.');
    expect(elements[1]).toHaveTextContent('1 janvier 2025 à 09:15');
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${PREMIER_ID}/notes`,
      expect.objectContaining({ method: 'GET' }),
    );
    client.clear();
  });

  it('affiche un état vide contextualisé', async () => {
    vi.stubGlobal('fetch', transportFicheEtNotes([]));
    const { client } = rendreFiche();

    expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(await screen.findByText('Aucune note de lecture pour Bel-Ami.')).toBeVisible();
    expect(
      screen.queryByRole('list', { name: 'Notes de lecture de Bel-Ami' }),
    ).not.toBeInTheDocument();
    client.clear();
  });

  it('garde la bibliographie visible après un échec et permet de réessayer', async () => {
    let appelsNotes = 0;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree) => {
      if (!String(entree).endsWith('/notes')) return reponseJson(ouvrage);
      appelsNotes += 1;
      if (appelsNotes < 3) {
        return reponseJson({ erreur: 'indisponible', message: 'Notes indisponibles.' }, 503);
      }
      return reponseJson(notes);
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFiche();

    const reessayer = await screen.findByRole(
      'button',
      { name: 'Réessayer le chargement des notes' },
      { timeout: DELAI_ATTENTE_REESSAI_MS },
    );
    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Notes indisponibles.');
    expect(reessayer).toHaveStyle({ minHeight: '44px' });
    fireEvent.click(reessayer);

    expect(await screen.findByRole('list', { name: 'Notes de lecture de Bel-Ami' })).toBeVisible();
    expect(appelsNotes).toBe(3);
    client.clear();
  });

  it('affiche une erreur de validation sans masquer la bibliographie', async () => {
    vi.stubGlobal('fetch', transportFicheEtNotes([{ ...notes[0], createdAt: 'hier' }]));
    const { client } = rendreFiche();

    expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La réponse du serveur pour les notes est invalide.',
    );
    expect(screen.getByText('Victor Havard')).toBeVisible();
    client.clear();
  });

  it('ignore une réponse tardive après un changement rapide d’ouvrage', async () => {
    let terminerPremieresNotes: ((reponse: Response) => void) | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const url = String(entree);
      if (url.endsWith(`/${PREMIER_ID}`)) return reponseJson(ouvrage);
      if (url.endsWith(`/${SECOND_ID}`)) {
        return reponseJson({ ...ouvrage, id: SECOND_ID, titre: 'Germinal' });
      }
      if (url.includes(`/${PREMIER_ID}/notes`)) {
        return new Promise<Response>((resolve) => {
          terminerPremieresNotes = resolve;
        });
      }
      return reponseJson([
        {
          ...notes[0],
          id: '73191de4-e6bd-4f04-96eb-b5c01a333703',
          livreId: SECOND_ID,
          contenu: 'Note de Germinal.',
        },
      ]);
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client, rerender } = rendreFiche();

    expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    rerender(<FicheScreen corriger={vi.fn()} id={SECOND_ID} retour={vi.fn()} />);

    expect(await screen.findByRole('heading', { name: 'Germinal' })).toBeVisible();
    expect(await screen.findByText('Note de Germinal.')).toBeVisible();
    await act(async () =>
      terminerPremieresNotes?.(new Response(JSON.stringify(notes), { status: 200 })),
    );

    expect(screen.getByText('Note de Germinal.')).toBeVisible();
    expect(screen.queryByText('Observation récente.')).not.toBeInTheDocument();
    expect(client.getQueryData(clesNotes.ouvrage(SECOND_ID))).toBeDefined();
    client.clear();
  });
});
