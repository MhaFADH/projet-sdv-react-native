import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { vi } from 'vitest';
import type { NoteLecture } from '../../domain/note-lecture';
import { FicheScreen } from '../../features/books/fiche-screen';
import { SuppressionsProvider } from '../../features/books/suppressions-provider';

export const ID_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8401';
export const ID_AUTRE_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8402';

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

const noteExistante: NoteLecture = {
  id: '03c36090-9281-40c4-8cf2-4e36c18304c6',
  livreId: ID_LIVRE,
  contenu: 'Observation ancienne.',
  createdAt: '2025-01-01T09:15:00',
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
  /** Réponse au `POST` ; par défaut un `201` immédiat portant le contenu envoyé. */
  post?: (contenu: string) => Promise<Response>;
  /** Réponse au `GET /books/:id` ; par défaut l'ouvrage demandé. */
  fiche?: (id: string) => Promise<Response>;
};

export const creerTransport = ({ post, fiche }: OptionsTransport = {}) => {
  const notes: NoteLecture[] = [noteExistante];
  const compteurs = { post: 0, lecturesNotes: 0, fiche: 0 };

  const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
    const url = String(entree);
    const methode = initialisation?.method ?? 'GET';

    if (url.endsWith('/notes')) {
      if (methode === 'POST') {
        compteurs.post += 1;
        const { contenu } = JSON.parse(String(initialisation?.body)) as { contenu: string };
        return post?.(contenu) ?? Promise.resolve(json(noteCreee(contenu), 201));
      }
      compteurs.lecturesNotes += 1;
      return Promise.resolve(json(notes));
    }

    if (methode === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }));

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
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <SuppressionsProvider>{children}</SuppressionsProvider>
    </QueryClientProvider>
  );
  const vue = render(<FicheScreen corriger={vi.fn()} id={id} retour={retour} />, { wrapper });
  return { client, retour, ...vue };
};

export const champNote = () => screen.getByRole('textbox', { name: 'Note de lecture' });

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
