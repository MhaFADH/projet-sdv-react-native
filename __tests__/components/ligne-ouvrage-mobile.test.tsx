import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async (importOriginal) => {
  const reactNative = await importOriginal<typeof import('react-native')>();
  return {
    ...reactNative,
    useWindowDimensions: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
  };
});

import { LigneOuvrage } from '../../components/books/ligne-ouvrage';
import { creerOuvrageTest } from '../fixtures/ouvrage';

const ouvrage = creerOuvrageTest();

describe('ligne d’ouvrage sur petit écran', () => {
  it('place la carte en pleine largeur sans retirer les commandes accessibles', () => {
    render(
      <LigneOuvrage
        basculeEnCours={false}
        basculerCoupDeCoeur={vi.fn()}
        basculerSelection={vi.fn()}
        couverture={{ type: 'distante', url: 'https://images.example/bel-ami.jpg' }}
        ouvertureDesactivee={false}
        ouvrage={ouvrage}
        ouvrirOuvrage={vi.fn()}
        selectionDesactivee={false}
        selectionne={false}
      />,
    );

    expect(screen.getByRole('button', { name: /^Bel-Ami/ })).toHaveStyle({ width: '100%' });
    expect(screen.getByRole('checkbox', { name: 'Sélectionner Bel-Ami' })).toBeVisible();
    expect(screen.getByRole('switch', { name: /coup de cœur/ })).toBeVisible();
  });
});
