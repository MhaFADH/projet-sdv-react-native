import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { vi } from 'vitest';
import { extraitNote, formaterDateNote, type NoteLecture } from '../../domain/note-lecture';
import { BasculesProvider } from '../../features/books/bascules-provider';
import { FicheScreen } from '../../features/books/fiche-screen';
import { SuppressionsProvider } from '../../features/books/suppressions-provider';
import { PreferencesProvider } from '../../features/preferences/preferences-provider';
import { creerEnveloppeOuvrages } from '../outils-rendu';

export const ID_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8401';
export const ID_AUTRE_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8402';

export const creerEnveloppeNotesAvecPreferences =
  (client: QueryClient) =>
  ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        <SuppressionsProvider>
          <BasculesProvider>{children}</BasculesProvider>
        </SuppressionsProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );

const ouvrage = {
  id: ID_LIVRE,
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

const autreOuvrage = { ...ouvrage, id: ID_AUTRE_LIVRE, titre: 'Germinal' };

export const noteExistante: NoteLecture = {
  id: '03c36090-9281-40c4-8cf2-4e36c18304c6',
  livreId: ID_LIVRE,
  contenu: 'Observation ancienne.',
  createdAt: '2025-01-01T09:15:00',
};

export const secondeNote: NoteLecture = {
  id: '73191de4-e6bd-4f04-96eb-b5c01a333703',
  livreId: ID_LIVRE,
  contenu: 'Observation récente.',
  createdAt: '2025-01-02T10:30:00',
};

export const json = (corps: unknown, statut = 200): Response =>
  new Response(JSON.stringify(corps), { status: statut });

export const noteCreee = (contenu: string): NoteLecture => ({
  id: 'b248b48c-8df4-4883-8a23-6f53b3145ec9',
  livreId: ID_LIVRE,
  contenu,
  createdAt: '2025-02-01T08:00:00',
});

type OptionsTransport = {
  post?: (contenu: string) => Promise<Response>;
  fiche?: (id: string) => Promise<Response>;
  notes?: readonly NoteLecture[];
  suppressionNote?: (noteId: string) => Promise<Response>;
  suppressionOuvrage?: (livreId: string) => Promise<Response>;
};

export const creerTransport = ({
  post,
  fiche,
  notes: notesInitiales = [noteExistante],
  suppressionNote,
  suppressionOuvrage,
}: OptionsTransport = {}) => {
  const notes: NoteLecture[] = [...notesInitiales];
  const compteurs = {
    post: 0,
    lecturesNotes: 0,
    fiche: 0,
    suppressionsNotes: 0,
    suppressionsOuvrages: 0,
  };

  const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
    const url = String(entree);
    const methode = initialisation?.method ?? 'GET';

    if (url.includes('/notes/')) {
      compteurs.suppressionsNotes += 1;
      const noteId = url.slice(url.lastIndexOf('/') + 1);
      if (suppressionNote) return suppressionNote(noteId);
      const index = notes.findIndex(({ id }) => id === noteId);
      if (index === -1) {
        return Promise.resolve(json({ erreur: 'introuvable', message: 'Note inconnue.' }, 404));
      }
      notes.splice(index, 1);
      return Promise.resolve(new Response(null, { status: 204 }));
    }

    if (url.endsWith('/notes')) {
      if (methode === 'POST') {
        compteurs.post += 1;
        const { contenu } = JSON.parse(String(initialisation?.body)) as { contenu: string };
        return post?.(contenu) ?? Promise.resolve(json(noteCreee(contenu), 201));
      }
      compteurs.lecturesNotes += 1;
      return Promise.resolve(json(notes));
    }

    if (methode === 'DELETE') {
      compteurs.suppressionsOuvrages += 1;
      if (suppressionOuvrage) return suppressionOuvrage(url.slice(url.lastIndexOf('/') + 1));
      return Promise.resolve(new Response(null, { status: 204 }));
    }

    compteurs.fiche += 1;
    const id = url.slice(url.lastIndexOf('/') + 1);
    if (fiche) return fiche(id);
    return Promise.resolve(json(id === ID_AUTRE_LIVRE ? autreOuvrage : ouvrage));
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, compteurs, notes };
};

export const rendreFiche = (id = ID_LIVRE) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const retour = vi.fn();
  const wrapper = creerEnveloppeOuvrages(client);
  const vue = render(<FicheScreen corriger={vi.fn()} id={id} retour={retour} />, { wrapper });
  return { client, retour, ...vue };
};

export const champNote = () => screen.getByRole('textbox', { name: 'Note de lecture' });

const libelleNote = (note: NoteLecture) =>
  `note du ${formaterDateNote(note.createdAt, 'fr-FR')} : « ${extraitNote(note.contenu)} »`;

export const boutonSupprimerNote = (note: NoteLecture) =>
  screen.getByRole('button', { name: `Supprimer la ${libelleNote(note)}` });

export const libelleDateNote = (note: NoteLecture) => formaterDateNote(note.createdAt, 'fr-FR');

export const boutonAjouter = () => screen.getByRole('button', { name: 'Ajouter la note' });

export const saisirNote = (contenu: string) =>
  fireEvent.change(champNote(), { target: { value: contenu } });

export const differer = () => {
  let terminer: (reponse: Response) => void = () => undefined;
  const promesse = new Promise<Response>((resolve) => {
    terminer = resolve;
  });
  return { promesse, terminer: (reponse: Response) => terminer(reponse) };
};
