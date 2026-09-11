import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { vi } from 'vitest';
import { FormulaireOuvrageScreen } from '../../features/books/formulaire-ouvrage-screen';
import { PreferencesProvider } from '../../features/preferences/preferences-provider';
import { PreferencesScreen } from '../../features/preferences/preferences-screen';

const ouvrageCree = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: '',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: 'https://picsum.photos/seed/abc/160/240',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
  version: 1,
};

export const rendreFormulaire = (avecPreferences = false) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        {avecPreferences ? <PreferencesScreen revenir={vi.fn()} /> : null}
        {children}
      </PreferencesProvider>
    </QueryClientProvider>
  );
  render(<FormulaireOuvrageScreen ouvrirOuvrage={vi.fn()} retourAuFonds={vi.fn()} />, { wrapper });
  return client;
};

const saisir = (nom: string, valeur: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: nom }), { target: { value: valeur } });

export const remplirSaisieValide = (titre = 'Bel-Ami') => {
  saisir('Titre', titre);
  saisir('Auteur', 'Guy de Maupassant');
  saisir('Année de publication', '1885');
};

export const enregistrer = (libelle = 'Enregistrer l’ouvrage') =>
  fireEvent.click(screen.getByRole('button', { name: libelle }));

export const couvertureEnvoyee = (
  appel: number,
  fetchMock: ReturnType<typeof vi.fn<typeof fetch>>,
) => {
  const corps: unknown = JSON.parse(String(fetchMock.mock.calls[appel][1]?.body));
  return (corps as { couverture: string }).couverture;
};

export const reponseCreation = () => new Response(JSON.stringify(ouvrageCree), { status: 201 });

export const reponse = (corps: unknown, status: number) =>
  new Response(JSON.stringify(corps), { status });
