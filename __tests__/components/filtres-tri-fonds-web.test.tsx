import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async (importOriginal) => {
  const reactNative = await importOriginal<typeof import('react-native')>();
  return {
    ...reactNative,
    useWindowDimensions: () => ({ width: 960, height: 800, scale: 1, fontScale: 1 }),
  };
});

import { FiltresTriFonds } from '../../components/books/filtres-tri-fonds';
import { CONSULTATION_FONDS_PAR_DEFAUT } from '../../domain/criteres-ouvrages';

describe('filtres et tri sur écran large', () => {
  it('empile les zones Affiner et Trier sans panneau dépliable', () => {
    render(<FiltresTriFonds appliquer={vi.fn()} consultation={CONSULTATION_FONDS_PAR_DEFAUT} />);

    const barre = screen.getByRole('toolbar', { name: 'Critères du fonds' });
    expect(barre).toHaveStyle({ flexDirection: 'column', borderWidth: '1px' });
    expect(screen.getByText('Affiner')).toBeVisible();
    expect(screen.getByText('Recommandations')).toHaveStyle({ whiteSpace: 'nowrap' });
    expect(screen.getByText('Trier')).toBeVisible();
    expect(screen.getByLabelText('Options de tri')).toHaveStyle({ borderTopWidth: '1px' });
    expect(screen.getAllByRole('radiogroup')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /^Filtres et tri\./ })).not.toBeInTheDocument();
  });
});
