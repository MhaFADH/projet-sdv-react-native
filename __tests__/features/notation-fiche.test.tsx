import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appliquerLangue } from '../../services/i18n';
import { ouvrage, rendreFiche, reponseJson } from './outils-notation';

afterEach(() => {
  appliquerLangue('fr');
  vi.unstubAllGlobals();
});

describe('présentation de la notation sur la fiche', () => {
  it('distingue l’absence de notation et ne propose que les valeurs de zéro à cinq', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation((entree) =>
          Promise.resolve(reponseJson(String(entree).endsWith('/notes') ? [] : ouvrage)),
        ),
    );
    const client = rendreFiche();

    expect(await screen.findByText('Aucune notation')).toBeVisible();
    expect(screen.getByRole('radiogroup', { name: 'Choisir une notation' })).toBeVisible();
    expect(screen.getAllByRole('radio')).toHaveLength(6);
    expect(screen.getByRole('radio', { name: 'Attribuer zéro étoile' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.queryByRole('button', { name: /effacer/i })).not.toBeInTheDocument();
    expect(screen.getByAltText('Couverture indisponible pour Bel-Ami')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    const noteZero = screen.getByRole('radio', { name: 'Attribuer zéro étoile' });
    expect(noteZero).toHaveStyle({ minHeight: '44px' });
    expect(noteZero).toHaveAttribute('tabindex', '0');
    noteZero.focus();
    expect(noteZero).toHaveFocus();
    client.clear();
  });

  it('remplace une couverture distante en échec sans masquer la fiche', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation((entree) =>
          Promise.resolve(
            reponseJson(
              String(entree).endsWith('/notes')
                ? []
                : { ...ouvrage, couverture: 'https://exemple.test/absente.jpg' },
            ),
          ),
        ),
    );
    const client = rendreFiche();

    const image = await screen.findByAltText('Couverture de Bel-Ami');
    fireEvent.error(image);

    expect(screen.getByAltText('Couverture indisponible pour Bel-Ami')).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    client.clear();
  });

  it.each([
    [0, '0 sur 5', 'Attribuer zéro étoile'],
    [1, '1 sur 5', 'Attribuer 1 étoile'],
    [2, '2 sur 5', 'Attribuer 2 étoiles'],
    [3, '3 sur 5', 'Attribuer 3 étoiles'],
    [4, '4 sur 5', 'Attribuer 4 étoiles'],
    [5, '5 sur 5', 'Attribuer 5 étoiles'],
  ] as const)('affiche distinctement la notation %i', async (note, texte, libelle) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation((entree) =>
          Promise.resolve(
            reponseJson(String(entree).endsWith('/notes') ? [] : { ...ouvrage, note }),
          ),
        ),
    );
    const client = rendreFiche();

    expect(await screen.findByText(texte)).toBeVisible();
    expect(screen.getByRole('radio', { name: libelle })).toHaveAttribute('aria-checked', 'true');
    client.clear();
  });
});
