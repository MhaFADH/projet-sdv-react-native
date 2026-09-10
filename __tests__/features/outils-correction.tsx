import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { expect, vi } from 'vitest';
import { CorrectionOuvrageScreen } from '../../features/books/correction-ouvrage-screen';

export const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';
export const DELAI_ATTENTE_REESSAI_MS = 3_000;

export const ouvrage = {
  id: ID,
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Havard',
  annee: 1885,
  lu: true,
  favori: true,
  note: 4,
  couverture: 'https://exemple.test/couverture.jpg',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

export const rendreCorrection = (identifiant = ID) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const retourAuFonds = vi.fn();
  const ouvrirOuvrage = vi.fn();
  render(
    <CorrectionOuvrageScreen
      id={identifiant}
      ouvrirOuvrage={ouvrirOuvrage}
      retourAuFonds={retourAuFonds}
    />,
    { wrapper },
  );
  return { client, ouvrirOuvrage, retourAuFonds };
};

export const reponse = (corps: unknown, status: number) =>
  new Response(JSON.stringify(corps), { status });

export const saisir = (nom: string, valeur: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: nom }), { target: { value: valeur } });

export const enregistrer = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la correction' }));

export const attendrePreremplissage = () =>
  waitFor(() => expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami'));

export const corpsEnvoye = (init: RequestInit | undefined): unknown =>
  JSON.parse(String(init?.body));
