import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  attendrePreremplissage,
  corpsEnvoye,
  enregistrer,
  ID,
  ouvrage,
  rendreCorrection,
  reponse,
  saisir,
} from './outils-correction';

const DELAI_TEMPORISATION_ECOULE_MS = 5_000;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('envoi d’une correction d’ouvrage', () => {
  it('envoie en PATCH les seuls champs corrigés et conserve les valeurs enregistrées', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse(ouvrage, 200))
      .mockResolvedValue(reponse({ ...ouvrage, titre: 'Bel Ami', version: 4 }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client, ouvrirOuvrage, retourAuFonds } = rendreCorrection();
    const invalidation = vi.spyOn(client, 'invalidateQueries');
    await attendrePreremplissage();

    saisir('Titre', 'Bel Ami');
    enregistrer();

    expect(await screen.findByText('« Bel Ami » a été corrigé.')).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith(
      `http://localhost:3000/books/${ID}`,
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(corpsEnvoye(fetchMock.mock.lastCall?.[1])).toEqual({ titre: 'Bel Ami' });
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel Ami');
    expect(screen.getByRole('textbox', { name: 'Éditeur (facultatif)' })).toHaveValue('Havard');
    expect(screen.getByRole('switch', { name: 'Statut de lecture' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(invalidation).toHaveBeenCalledWith({ queryKey: ['ouvrages', 'liste'] });
    expect(retourAuFonds).not.toHaveBeenCalled();
    expect(client.getQueryData(['ouvrages', 'fiche', ID])).toMatchObject({ version: 4 });

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la fiche' }));
    expect(ouvrirOuvrage).toHaveBeenCalledWith(ID);
    client.clear();
  });

  it('applique les règles de validation communes sans rien envoyer', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponse(ouvrage, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', '   ');
    saisir('Année de publication', '1449');
    enregistrer();

    expect(await screen.findByText('Le titre est obligatoire.')).toBeVisible();
    expect(
      screen.getByText(`L’année doit être comprise entre 1450 et ${new Date().getFullYear() + 1}.`),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    client.clear();
  });

  it('reporte un refus 422 par champ en conservant la saisie', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(reponse(ouvrage, 200))
        .mockResolvedValue(
          reponse({ erreur: 'validation', champs: { annee: 'annee refusée' } }, 422),
        ),
    );
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Année de publication', '1886');
    enregistrer();

    expect(await screen.findByText('annee refusée')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Année de publication' })).toHaveValue('1886');
    expect(screen.queryByText(/a été corrigé/)).not.toBeInTheDocument();
    client.clear();
  });

  it('verrouille la saisie pendant l’envoi et empêche une double soumission', async () => {
    let resoudre: (reponseCorrection: Response) => void = () => {};
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse(ouvrage, 200))
      .mockImplementation(() => new Promise<Response>((resolve) => (resoudre = resolve)));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', 'Bel Ami');
    enregistrer();

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveAttribute('readonly'),
    );
    const bouton = screen.getByRole('button', { name: 'Enregistrement en cours…' });
    expect(bouton).toBeDisabled();
    fireEvent.click(bouton);

    resoudre(reponse({ ...ouvrage, titre: 'Bel Ami' }, 200));
    expect(await screen.findByText('« Bel Ami » a été corrigé.')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('ne remplace pas une saisie modifiée par une réactualisation du serveur', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse(ouvrage, 200))
      .mockResolvedValue(reponse({ ...ouvrage, titre: 'Titre serveur', version: 9 }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', 'Correction du libraire');
    await client.invalidateQueries({ queryKey: ['ouvrages', 'fiche', ID] });

    await waitFor(() =>
      expect(client.getQueryData(['ouvrages', 'fiche', ID])).toMatchObject({ version: 9 }),
    );
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Correction du libraire');
    client.clear();
  });

  it('présente un résultat incertain sans annoncer de succès et permet un réessai', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse(ouvrage, 200))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(reponse({ ...ouvrage, titre: 'Bel Ami' }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client, ouvrirOuvrage } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', 'Bel Ami');
    enregistrer();

    expect(
      await screen.findByText(/la correction n’a peut-être pas été enregistrée/),
    ).toBeVisible();
    expect(screen.queryByText(/a été corrigé/)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel Ami');
    expect(ouvrirOuvrage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer la correction' }));
    expect(await screen.findByText('« Bel Ami » a été corrigé.')).toBeVisible();
    client.clear();
  });

  it('conserve la saisie lorsqu’une réactualisation de la fiche échoue', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse(ouvrage, 200))
      .mockResolvedValue(reponse({ erreur: 'serveur' }, 500));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', 'Correction du libraire');
    await client.invalidateQueries({ queryKey: ['ouvrages', 'fiche', ID] });
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(1));

    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Correction du libraire');
    expect(
      screen.queryByRole('heading', { name: 'Impossible de charger cet ouvrage' }),
    ).not.toBeInTheDocument();
    client.clear();
  });

  it('n’envoie rien et le dit lorsque la saisie est identique à la fiche', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponse(ouvrage, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    enregistrer();

    expect(
      await screen.findByText('Aucune modification à enregistrer : la fiche est déjà à jour.'),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(screen.queryByText(/a été corrigé/)).not.toBeInTheDocument();
    client.clear();
  });

  it('conserve la saisie et propose un réessai temporisé sur une indisponibilité 503', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(reponse(ouvrage, 200))
        .mockResolvedValueOnce(reponse({ erreur: 'indisponible' }, 503))
        .mockResolvedValue(reponse({ ...ouvrage, titre: 'Bel Ami' }, 200)),
    );
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', 'Bel Ami');
    enregistrer();

    expect(await screen.findByText(/Votre saisie est conservée./)).toBeVisible();
    const reessai = screen.getByRole('button', { name: /Réessayer dans \d s/ });
    expect(reessai).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel Ami');

    await waitFor(
      () =>
        expect(screen.getByRole('button', { name: 'Réessayer l’enregistrement' })).toBeEnabled(),
      { timeout: DELAI_TEMPORISATION_ECOULE_MS },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer l’enregistrement' }));
    expect(await screen.findByText('« Bel Ami » a été corrigé.')).toBeVisible();
    client.clear();
  });
});
