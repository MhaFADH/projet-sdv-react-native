import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormulaireOuvrageScreen } from '../../features/books/formulaire-ouvrage-screen';
import { PreferencesProvider } from '../../features/preferences/preferences-provider';
import { PreferencesScreen } from '../../features/preferences/preferences-screen';
import { appliquerLangue } from '../../services/i18n';

const rendreCreation = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </QueryClientProvider>
  );
  render(
    <>
      <PreferencesScreen revenir={vi.fn()} />
      <FormulaireOuvrageScreen ouvrirOuvrage={vi.fn()} retourAuFonds={vi.fn()} />
    </>,
    { wrapper },
  );
  return client;
};

const saisir = (nom: string, valeur: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: nom }), { target: { value: valeur } });

beforeEach(() => {
  window.localStorage.clear();
  appliquerLangue('fr');
});

afterEach(() => {
  appliquerLangue('fr');
  vi.unstubAllGlobals();
});

describe('adaptation des parcours d’ouvrages aux préférences', () => {
  it('retraduit une indisponibilité de création sans perdre la saisie ni renvoyer', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
        status: 503,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreCreation();

    saisir('Titre', 'Bel-Ami');
    saisir('Auteur', 'Guy de Maupassant');
    saisir('Année de publication', '1885');
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer l’ouvrage' }));
    expect(
      await screen.findByText(
        'Le service est temporairement indisponible. Votre saisie est conservée.',
      ),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));

    expect(
      await screen.findByText('The service is temporarily unavailable. Your entry is preserved.'),
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Bel-Ami');
    expect(fetchMock).toHaveBeenCalledOnce();
    client.clear();
  });

  it('retraduit un refus de champ sans perdre la saisie ni renvoyer', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ erreur: 'validation', champs: { annee: 'annee invalide' } }),
          { status: 422 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreCreation();

    saisir('Titre', 'Bel-Ami');
    saisir('Auteur', 'Guy de Maupassant');
    saisir('Année de publication', '1885');
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer l’ouvrage' }));
    expect(await screen.findByText('L’année de publication est invalide.')).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));

    expect(await screen.findByText('The publication year is invalid.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Bel-Ami');
    expect(fetchMock).toHaveBeenCalledOnce();
    client.clear();
  });
});
