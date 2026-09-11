import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appliquerLangue } from '../../services/i18n';
import {
  couvertureEnvoyee,
  enregistrer,
  remplirSaisieValide,
  rendreFormulaire,
  reponse,
  reponseCreation,
} from './outils-creation';

const DELAI_TEMPORISATION_MS = 3_000;

const avancer = (duree: number) => act(async () => void (await vi.advanceTimersByTimeAsync(duree)));

afterEach(() => {
  appliquerLangue('fr');
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('couverture générée à la création', () => {
  it('envoie une URL de couverture absolue dans le premier POST', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();

    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(couvertureEnvoyee(0, fetchMock)).toMatch(/^https:\/\//);
    client.clear();
  });

  it('renvoie la même URL après un refus 422 sans effacer la saisie', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        reponse({ erreur: 'validation', champs: { annee: 'annee invalide' } }, 422),
      )
      .mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText('annee invalide')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');

    enregistrer();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(couvertureEnvoyee(1, fetchMock)).toBe(couvertureEnvoyee(0, fetchMock));
    client.clear();
  });

  it('renvoie la même URL au réessai temporisé qui suit un 503', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(reponse({ erreur: 'chaos', message: 'Service indisponible.' }, 503));
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await avancer(DELAI_TEMPORISATION_MS);

    enregistrer('Réessayer l’enregistrement');
    await avancer(0);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(couvertureEnvoyee(1, fetchMock)).toBe(couvertureEnvoyee(0, fetchMock));
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');
    client.clear();
  });

  it('renvoie la même URL au réessai manuel averti d’un résultat incertain', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText(/l’ouvrage a peut-être été créé/)).toBeVisible();
    expect(
      screen.getByText(/la création n’est pas rejouable sans risque de doublon/),
    ).toBeVisible();

    enregistrer('Réessayer malgré le risque de doublon');

    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(couvertureEnvoyee(1, fetchMock)).toBe(couvertureEnvoyee(0, fetchMock));
    client.clear();
  });

  it('n’envoie qu’une seule URL lorsque la soumission est répétée pendant l’envoi', async () => {
    let resoudre: (reponse: Response) => void = () => {};
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() => new Promise<Response>((resolve) => (resoudre = resolve)));
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Enregistrement en cours…' })).toBeDisabled(),
    );

    enregistrer('Enregistrement en cours…');
    resoudre(reponseCreation());

    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    client.clear();
  });

  it('génère une nouvelle URL pour la création volontaire suivante', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();

    remplirSaisieValide('Pierre et Jean');
    enregistrer();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(couvertureEnvoyee(1, fetchMock)).not.toBe(couvertureEnvoyee(0, fetchMock));
    client.clear();
  });
});
