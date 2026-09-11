import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appliquerLangue } from '../../services/i18n';
import {
  attendrePreremplissage,
  DELAI_ATTENTE_REESSAI_MS,
  ID,
  ouvrage,
  rendreCorrection,
  reponse,
} from './outils-correction';

afterEach(() => {
  appliquerLangue('fr');
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ouverture du formulaire de correction', () => {
  it('préremplit les cinq champs du lot 1 depuis la fiche demandée', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponse(ouvrage, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();

    expect(screen.getByLabelText('Chargement de l’ouvrage à corriger')).toBeVisible();
    await attendrePreremplissage();

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID}`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(screen.getByRole('heading', { name: 'Corriger un ouvrage' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Auteur' })).toHaveValue('Guy de Maupassant');
    expect(screen.getByRole('textbox', { name: 'Éditeur (facultatif)' })).toHaveValue('Havard');
    expect(screen.getByRole('textbox', { name: 'Année de publication' })).toHaveValue('1885');
    expect(screen.getByRole('switch', { name: 'Statut de lecture' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    client.clear();
  });

  it('présente un ouvrage introuvable sans proposer une fausse création', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(reponse({ erreur: 'introuvable' }, 404)),
    );
    const { client } = rendreCorrection();

    expect(
      await screen.findByRole('heading', { name: 'Cet ouvrage ne peut pas être corrigé' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Enregistrer la correction' }),
    ).not.toBeInTheDocument();
    client.clear();
  });

  it('propose un réessai lorsque la lecture de l’ouvrage échoue', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reponse({ erreur: 'serveur' }, 500))
      .mockResolvedValueOnce(reponse({ erreur: 'serveur' }, 500))
      .mockResolvedValue(reponse(ouvrage, 200));
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreCorrection();

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Impossible de charger cet ouvrage' },
        { timeout: DELAI_ATTENTE_REESSAI_MS },
      ),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await attendrePreremplissage();
    client.clear();
  });

  it('localise l’absence déduite d’un identifiant inutilisable', () => {
    appliquerLangue('en');

    const { client } = rendreCorrection('');

    expect(screen.getByText('This book does not exist or is no longer available.')).toBeVisible();
    client.clear();
  });
});
