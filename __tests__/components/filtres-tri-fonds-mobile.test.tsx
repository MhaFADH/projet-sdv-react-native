import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async (importOriginal) => {
  const reactNative = await importOriginal<typeof import('react-native')>();
  return {
    ...reactNative,
    useWindowDimensions: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
  };
});

import { FiltresTriFonds } from '../../components/books/filtres-tri-fonds';
import type { ConsultationFonds } from '../../domain/criteres-ouvrages';

const consultation: ConsultationFonds = {
  recherche: '',
  lecture: 'nonlu',
  recommandation: 'favoris',
  tri: 'annee',
  ordre: 'desc',
};

describe('filtres et tri sur petit écran', () => {
  it('les rassemble derrière un bouton qui résume les critères actifs', () => {
    const appliquer = vi.fn();
    render(<FiltresTriFonds appliquer={appliquer} consultation={consultation} />);

    const ouvrir = screen.getByRole('button', {
      name: 'Filtres et tri. Non lus, Coups de cœur, Année décroissant',
    });
    expect(ouvrir).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('radiogroup', { name: 'Filtre de lecture' })).not.toBeInTheDocument();

    ouvrir.focus();
    fireEvent.keyDown(ouvrir, { key: ' ' });

    expect(ouvrir).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('radiogroup', { name: 'Filtre de lecture' })).toBeVisible();
    const nonLus = screen.getByRole('radio', { name: 'Non lus' });
    expect(nonLus).toHaveAttribute('aria-checked', 'true');
    expect(nonLus).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(nonLus, { key: 'ArrowRight' });
    expect(appliquer).toHaveBeenCalledWith({ ...consultation, lecture: 'tous' });
    expect(screen.getByRole('radio', { name: 'Tous les statuts' })).toHaveFocus();
  });
});
