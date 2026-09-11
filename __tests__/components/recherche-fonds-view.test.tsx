import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FondsView } from '../../components/books/fonds-view';
import { creerCoupsDeCoeurInertes } from './outils-fonds';

const etatVide = {
  type: 'succes' as const,
  page: { items: [], page: 1, limit: 20 as const, total: 0, totalPages: 1 },
  pagePrecedente: vi.fn(),
  pageSuivante: vi.fn(),
  ouvrirOuvrage: vi.fn(),
  coupsDeCoeur: creerCoupsDeCoeurInertes(),
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
        ouvrirPreferences={vi.fn()}
        recherche={{ valeurAppliquee: 'inconnu', appliquer: vi.fn() }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Aucun résultat' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Le fonds est vide' })).not.toBeInTheDocument();
  });

  it('conserve les données pendant un échec de relecture', () => {
    const reessayer = vi.fn();
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          ...etatVide,
          page: {
            ...etatVide.page,
            items: [
              {
                id: '33575fa9-7968-45b3-8447-ec994a0b8401',
                titre: 'Bel-Ami',
                auteur: 'Guy de Maupassant',
                editeur: 'Victor Havard',
                annee: 1885,
                lu: true,
                favori: false,
                note: 4,
                couverture: null,
                createdAt: '2025-01-01T10:00:00.000Z',
                updatedAt: '2025-01-02T10:00:00.000Z',
                version: 4,
              },
            ],
            total: 1,
          },
          erreurActualisation: { message: 'Lecture impossible.', reessayer },
        }}
        ouvrirPreferences={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Impossible d’actualiser le fonds' })).toBeVisible();
    expect(screen.getByText('Lu')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(reessayer).toHaveBeenCalledOnce();
  });
});
