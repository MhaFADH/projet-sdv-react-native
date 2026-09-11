import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CouvertureOuvrage } from '../../components/books/couverture-ouvrage';

describe('couverture d’un ouvrage', () => {
  it('réserve ses dimensions et remplace une ressource inaccessible par le visuel local', () => {
    const url = 'https://images.example.com/bel-ami.jpg';
    render(<CouvertureOuvrage couverture={{ type: 'distante', url }} titre="Bel-Ami" />);

    const imageDistante = screen.getByRole('img', { name: 'Couverture de Bel-Ami' });
    expect(imageDistante).toHaveAttribute('src', url);
    expect(imageDistante).toHaveAttribute('data-cache-policy', 'memory-disk');
    expect(imageDistante).toHaveStyle({ width: '80px', height: '120px' });

    fireEvent.error(imageDistante);

    const visuelLocal = screen.getByRole('img', { name: 'Couverture indisponible pour Bel-Ami' });
    expect(visuelLocal).not.toHaveAttribute('src', url);
    expect(visuelLocal).toHaveStyle({ width: '80px', height: '120px' });
  });

  it('affiche directement le visuel local pour une valeur invalide', () => {
    render(<CouvertureOuvrage couverture={{ type: 'locale' }} titre="Germinal" />);

    expect(
      screen.getByRole('img', { name: 'Couverture indisponible pour Germinal' }),
    ).toBeVisible();
  });
});
