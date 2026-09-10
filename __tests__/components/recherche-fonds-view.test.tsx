import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FondsView } from '../../components/books/fonds-view';

const etatVide = {
  type: 'succes' as const,
  page: { items: [], page: 1, limit: 20 as const, total: 0, totalPages: 1 },
  pagePrecedente: vi.fn(),
  pageSuivante: vi.fn(),
  ouvrirOuvrage: vi.fn(),
  selection: {
    identifiants: new Set<string>(),
    basculer: vi.fn(),
    demanderSuppression: vi.fn(),
    suppressionDesactivee: false,
  },
};

describe('recherche présentée dans le fonds', () => {
  it('distingue une recherche sans résultat d’un fonds vide', () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={etatVide}
        recherche={{ valeurAppliquee: 'inconnu', appliquer: vi.fn() }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Aucun résultat' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Le fonds est vide' })).not.toBeInTheDocument();
  });
});
