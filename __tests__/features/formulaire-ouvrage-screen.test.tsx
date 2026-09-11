import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaireOuvrageScreen } from '../../features/books/formulaire-ouvrage-screen';
import { appliquerLangue } from '../../services/i18n';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';

const ouvrageCree = {
  id: ID,
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
  const ouvrirOuvrage = vi.fn();
  render(<FormulaireOuvrageScreen ouvrirOuvrage={ouvrirOuvrage} retourAuFonds={retourAuFonds} />, {
    wrapper,
  });
  return { client, retourAuFonds, ouvrirOuvrage };
};

const saisir = (nom: string, valeur: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: nom }), { target: { value: valeur } });

const remplirSaisieValide = () => {
  saisir('Titre', 'Bel-Ami');
  saisir('Auteur', 'Guy de Maupassant');
  saisir('Année de publication', '1885');
};

const enregistrer = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer l’ouvrage' }));

const reponseCreation = () => new Response(JSON.stringify(ouvrageCree), { status: 201 });

afterEach(() => {
  appliquerLangue('fr');
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ajout d’un ouvrage', () => {
  it('ouvre le formulaire avec une année vide et le statut « Non lu »', () => {
    rendreFormulaire();

    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Auteur' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Éditeur (facultatif)' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Année de publication' })).toHaveValue('');
    expect(screen.getByRole('switch', { name: 'Statut de lecture' })).not.toBeChecked();
    expect(screen.getByText('Non lu')).toBeVisible();
  });

  it('associe les refus de validation aux champs concernés sans rien envoyer', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    rendreFormulaire();

    saisir('Titre', '   ');
    saisir('Auteur', 'a'.repeat(201));
    saisir('Année de publication', '1449');
    enregistrer();

    expect(await screen.findByText('Le titre est obligatoire.')).toBeVisible();
    expect(screen.getByText('L’auteur ne peut pas dépasser 200 caractères.')).toBeVisible();
    expect(
      screen.getByText(`L’année doit être comprise entre 1450 et ${new Date().getFullYear() + 1}.`),
    ).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('crée l’ouvrage, vide le formulaire et propose la fiche sans redirection', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const { client, ouvrirOuvrage, retourAuFonds } = rendreFormulaire();
    const invalidation = vi.spyOn(client, 'invalidateQueries');

    remplirSaisieValide();
    enregistrer();

    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/books',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Année de publication' })).toHaveValue('');
    expect(screen.getByRole('switch', { name: 'Statut de lecture' })).not.toBeChecked();
    expect(invalidation).toHaveBeenCalledWith({ queryKey: ['ouvrages', 'liste'] });
    expect(retourAuFonds).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la fiche' }));
    expect(ouvrirOuvrage).toHaveBeenCalledWith(ID);
    client.clear();
  });

  it('localise l’action du toast de création', async () => {
    appliquerLangue('en');
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reponseCreation()));
    const { client } = rendreFormulaire();

    saisir('Title', 'Bel-Ami');
    saisir('Author', 'Guy de Maupassant');
    saisir('Publication year', '1885');
    fireEvent.click(screen.getByRole('button', { name: 'Save the book' }));

    expect(await screen.findByRole('button', { name: 'Open the record' })).toBeVisible();
    client.clear();
  });

  it('verrouille les champs pendant l’envoi et empêche une double soumission', async () => {
    let resoudre: (reponse: Response) => void = () => {};
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() => new Promise<Response>((resolve) => (resoudre = resolve)));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveAttribute('readonly'),
    );
    expect(screen.getByRole('button', { name: 'Enregistrement en cours…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrement en cours…' }));

    resoudre(reponseCreation());
    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    client.clear();
  });

  it('alimente les champs refusés par un 422 sans vider la saisie', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ erreur: 'validation', champs: { annee: 'annee invalide' } }),
            { status: 422 },
          ),
        ),
    );
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();

    expect(await screen.findByText('L’année de publication est invalide.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');
    expect(screen.getByRole('textbox', { name: 'Année de publication' })).toHaveValue('1885');
    expect(screen.queryByText('« Bel-Ami » a été ajouté au fonds.')).not.toBeInTheDocument();
    client.clear();
  });

  it('avertit d’un résultat incertain sans réessai automatique ni faux succès', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    const { client, retourAuFonds } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();

    expect(await screen.findByText(/l’ouvrage a peut-être été créé/)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Réessayer malgré le risque de doublon' }),
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');
    expect(screen.queryByText('« Bel-Ami » a été ajouté au fonds.')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Vérifier dans le fonds' }));
    expect(screen.getByRole('heading', { name: 'Abandonner cette saisie ?' })).toBeVisible();
    expect(retourAuFonds).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Abandonner la saisie' }));
    expect(retourAuFonds).toHaveBeenCalledOnce();
    client.clear();
  });

  it('réessaie une création incertaine uniquement sur demande explicite', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText(/l’ouvrage a peut-être été créé/)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer malgré le risque de doublon' }));

    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('protège une nouvelle saisie avant d’ouvrir la fiche créée', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reponseCreation()));
    const { client, ouvrirOuvrage } = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();

    saisir('Titre', 'Une autre saisie');
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la fiche' }));

    expect(await screen.findByRole('heading', { name: 'Abandonner cette saisie ?' })).toBeVisible();
    expect(ouvrirOuvrage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Abandonner la saisie' }));
    expect(ouvrirOuvrage).toHaveBeenCalledExactlyOnceWith(ID);
    client.clear();
  });
});
