import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaireOuvrageScreen } from '../../features/books/formulaire-ouvrage-screen';

const DUREE_TOAST_MS = 5_000;
const DELAI_TEMPORISATION_MS = 3_000;
const MESSAGE_SUCCES = '« Bel-Ami » a été ajouté au fonds.';

const ouvrageCree = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: '',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
  version: 1,
};

const rendreFormulaire = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const retourAuFonds = vi.fn();
  render(<FormulaireOuvrageScreen ouvrirOuvrage={vi.fn()} retourAuFonds={retourAuFonds} />, {
    wrapper,
  });
  return { client, retourAuFonds };
};

const saisir = (nom: string, valeur: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: nom }), { target: { value: valeur } });

const remplirSaisieValide = (titre = 'Bel-Ami') => {
  saisir('Titre', titre);
  saisir('Auteur', 'Guy de Maupassant');
  saisir('Année de publication', '1885');
};

const enregistrer = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer l’ouvrage' }));

const avancer = (duree: number) => act(async () => void (await vi.advanceTimersByTimeAsync(duree)));

const reponseCreation = (titre = 'Bel-Ami') =>
  new Response(JSON.stringify({ ...ouvrageCree, titre }), { status: 201 });

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('retour de succès et temporisation', () => {
  it('efface le toast après cinq secondes', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reponseCreation()));
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await avancer(0);
    expect(screen.getByText(MESSAGE_SUCCES)).toBeVisible();

    await avancer(DUREE_TOAST_MS - 1);
    expect(screen.getByText(MESSAGE_SUCCES)).toBeVisible();
    await avancer(1);
    expect(screen.queryByText(MESSAGE_SUCCES)).not.toBeInTheDocument();
    client.clear();
  });

  it('suspend la disparition pendant le survol du toast', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reponseCreation()));
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await avancer(0);

    fireEvent.pointerEnter(screen.getByTestId('toast-succes'));
    await avancer(DUREE_TOAST_MS * 2);
    expect(screen.getByText(MESSAGE_SUCCES)).toBeVisible();

    fireEvent.pointerLeave(screen.getByTestId('toast-succes'));
    await avancer(DUREE_TOAST_MS);
    expect(screen.queryByText(MESSAGE_SUCCES)).not.toBeInTheDocument();
    client.clear();
  });

  it('suspend la disparition pendant le focus clavier de son bouton', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reponseCreation()));
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await avancer(0);

    fireEvent.focus(screen.getByRole('button', { name: 'Ouvrir la fiche' }));
    await avancer(DUREE_TOAST_MS * 2);
    expect(screen.getByRole('button', { name: 'Ouvrir la fiche' })).toBeVisible();

    fireEvent.blur(screen.getByRole('button', { name: 'Ouvrir la fiche' }));
    await avancer(DUREE_TOAST_MS);
    expect(screen.queryByText(MESSAGE_SUCCES)).not.toBeInTheDocument();
    client.clear();
  });

  it('remplace le toast précédent par la nouvelle réussite', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(reponseCreation())
        .mockResolvedValue(reponseCreation('Pierre et Jean')),
    );
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await avancer(0);
    expect(screen.getByText(MESSAGE_SUCCES)).toBeVisible();

    remplirSaisieValide('Pierre et Jean');
    enregistrer();
    await avancer(0);

    expect(screen.getByText('« Pierre et Jean » a été ajouté au fonds.')).toBeVisible();
    expect(screen.queryByText(MESSAGE_SUCCES)).not.toBeInTheDocument();
    client.clear();
  });

  it('conserve la saisie et temporise le réessai après un 503', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
        status: 503,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await avancer(0);

    expect(screen.getByRole('button', { name: 'Réessayer dans 3 s' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');
    await avancer(DELAI_TEMPORISATION_MS);
    expect(fetchMock).toHaveBeenCalledOnce();

    const reessai = screen.getByRole('button', { name: 'Réessayer l’enregistrement' });
    expect(reessai).not.toBeDisabled();
    fireEvent.click(reessai);
    await avancer(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('demande confirmation avant d’abandonner une saisie modifiée', async () => {
    const { retourAuFonds } = rendreFormulaire();

    fireEvent.click(screen.getByRole('button', { name: '← Retour au fonds' }));
    expect(retourAuFonds).toHaveBeenCalledOnce();

    saisir('Titre', 'Bel-Ami');
    fireEvent.click(screen.getByRole('button', { name: '← Retour au fonds' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Abandonner cette saisie ?' })).toBeVisible(),
    );
    expect(retourAuFonds).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Poursuivre la saisie' }));
    expect(
      screen.queryByRole('heading', { name: 'Abandonner cette saisie ?' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');

    fireEvent.click(screen.getByRole('button', { name: '← Retour au fonds' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Abandonner la saisie' }));
    expect(retourAuFonds).toHaveBeenCalledTimes(2);
  });

  it('avertit le navigateur d’un départ seulement lorsque la saisie est modifiée', () => {
    rendreFormulaire();
    const depart = () => {
      const evenement = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(evenement);
      return evenement.defaultPrevented;
    };

    expect(depart()).toBe(false);

    saisir('Titre', 'Bel-Ami');

    expect(depart()).toBe(true);
  });

  it('vide de nouveau le formulaire après une seconde création confirmée', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_url, init) => {
      const corps: unknown = JSON.parse(String((init as RequestInit).body));
      const titre = (corps as { titre: string }).titre;
      return new Response(JSON.stringify({ ...ouvrageCree, titre }), { status: 201 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFormulaire();

    remplirSaisieValide('Premier ouvrage');
    enregistrer();
    expect(await screen.findByText('« Premier ouvrage » a été ajouté au fonds.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('');

    remplirSaisieValide('Second ouvrage');
    enregistrer();

    expect(await screen.findByText('« Second ouvrage » a été ajouté au fonds.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Année de publication' })).toHaveValue('');
    client.clear();
  });
});
