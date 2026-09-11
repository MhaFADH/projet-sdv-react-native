import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appliquerLangue } from '../../services/i18n';
import {
  attendrePreremplissage,
  enregistrer,
  ouvrage,
  rendreCorrection,
  reponse,
  saisir,
} from './outils-correction';

afterEach(() => {
  appliquerLangue('fr');
  vi.unstubAllGlobals();
});

describe('préférences appliquées à la correction d’un ouvrage', () => {
  it('suit une bascule de langue sans altérer la saisie ni la protection du réessai', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse(ouvrage, 200))
      .mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();
    await attendrePreremplissage();

    saisir('Titre', 'Bel Ami');
    enregistrer();
    expect(
      await screen.findByText(/la correction n’a peut-être pas été enregistrée/),
    ).toBeVisible();

    act(() => appliquerLangue('en'));

    expect(await screen.findByText(/the change may not have been saved/)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Edit a book' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry the change' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Bel Ami');
    expect(screen.getByRole('textbox', { name: 'Author' })).toHaveValue('Guy de Maupassant');
    client.clear();
  });
});
