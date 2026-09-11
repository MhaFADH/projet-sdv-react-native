import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appliquerLangue } from '../../services/i18n';
import {
  couvertureEnvoyee,
  enregistrer,
  remplirSaisieValide,
  rendreFormulaire,
  reponseCreation,
} from './outils-creation';

afterEach(() => {
  appliquerLangue('fr');
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('préférences appliquées à la création d’un ouvrage', () => {
  it('conserve l’URL lors d’une bascule de langue et traduit l’avertissement', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire();

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText(/l’ouvrage a peut-être été créé/)).toBeVisible();

    act(() => appliquerLangue('en'));

    expect(await screen.findByText(/the book may have been created/)).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Bel-Ami');

    enregistrer('Retry despite the duplicate risk');

    expect(await screen.findByText('“Bel-Ami” was added to the collection.')).toBeVisible();
    expect(couvertureEnvoyee(1, fetchMock)).toBe(couvertureEnvoyee(0, fetchMock));
    client.clear();
  });

  it('conserve l’URL lors d’une bascule de thème', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(reponseCreation());
    vi.stubGlobal('fetch', fetchMock);
    const client = rendreFormulaire(true);

    remplirSaisieValide();
    enregistrer();
    expect(await screen.findByText(/l’ouvrage a peut-être été créé/)).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Sombre' }));

    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Sombre' })).toHaveAttribute('aria-checked', 'true'),
    );
    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveValue('Bel-Ami');

    enregistrer('Réessayer malgré le risque de doublon');

    expect(await screen.findByText('« Bel-Ami » a été ajouté au fonds.')).toBeVisible();
    expect(couvertureEnvoyee(1, fetchMock)).toBe(couvertureEnvoyee(0, fetchMock));
    window.localStorage.clear();
    client.clear();
  });

  it('traduit les refus de validation déjà affichés après une bascule de langue', async () => {
    const client = rendreFormulaire();

    enregistrer();
    expect(await screen.findByText('Le titre est obligatoire.')).toBeVisible();

    act(() => appliquerLangue('en'));

    expect(await screen.findByText('The title is required.')).toBeVisible();
    expect(screen.queryByText('Le titre est obligatoire.')).not.toBeInTheDocument();
    client.clear();
  });
});
