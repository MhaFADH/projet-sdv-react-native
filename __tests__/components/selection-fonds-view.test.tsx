import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FondsView } from '../../components/books/fonds-view';

const ouvrage = {
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
  version: 3,
};

const creerEtat = (
  identifiants: ReadonlySet<string>,
  basculer: (id: string) => void,
  demanderSuppression: () => void,
) => ({
  type: 'succes' as const,
  page: { items: [ouvrage], page: 1, limit: 20, total: 1, totalPages: 1 },
  pagePrecedente: vi.fn(),
  pageSuivante: vi.fn(),
  ouvrirOuvrage: vi.fn(),
  selection: {
    identifiants,
    basculer,
    demanderSuppression,
    suppressionDesactivee: false,
  },
});

describe('sélection dans la présentation du fonds', () => {
  it('expose une case accessible et une action reflétant exactement la sélection', () => {
    const basculer = vi.fn();
    const demanderSuppression = vi.fn();
    const vue = render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={creerEtat(new Set(), basculer, demanderSuppression)}
      />,
    );

    const caseBelAmi = screen.getByRole('checkbox', { name: 'Sélectionner Bel-Ami' });
    expect(caseBelAmi).toHaveAttribute('aria-checked', 'false');
    expect(caseBelAmi).toHaveAttribute('tabindex', '0');
    expect(caseBelAmi).toHaveStyle({ minHeight: '44px', minWidth: '44px' });
    expect(screen.getByRole('button', { name: '0 sélectionnés — Supprimer' })).toBeDisabled();

    fireEvent.click(caseBelAmi);
    expect(basculer).toHaveBeenCalledExactlyOnceWith(ouvrage.id);

    vue.rerender(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={creerEtat(new Set([ouvrage.id]), basculer, demanderSuppression)}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Sélectionner Bel-Ami' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    const supprimer = screen.getByRole('button', { name: '1 sélectionné — Supprimer' });
    expect(supprimer).toBeEnabled();
    expect(supprimer).toHaveStyle({ minHeight: '44px' });
    fireEvent.click(supprimer);

    expect(demanderSuppression).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Supprimer Bel-Ami' })).not.toBeInTheDocument();
  });
});
