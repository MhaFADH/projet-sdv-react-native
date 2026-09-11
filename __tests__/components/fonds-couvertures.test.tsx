import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FondsView } from '../../components/books/fonds-view';
import type { Ouvrage } from '../../domain/ouvrage';
import { resoudreCouverture } from '../../services/couvertures';
import { creerOuvrageTest } from '../fixtures/ouvrage';
import { creerCoupsDeCoeurInertes } from './outils-fonds';

const ouvrage = creerOuvrageTest({ note: 4.5 });

const creerEtat = (ouvrages: Ouvrage[]) => ({
  type: 'succes' as const,
  page: {
    items: ouvrages.map((element) => ({
      ouvrage: element,
      couverture: resoudreCouverture(element.couverture, element.id),
    })),
    page: 1,
    limit: 20,
    total: ouvrages.length,
    totalPages: 1,
  },
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
});

describe('couvertures et notations du fonds', () => {
  it('illustre chaque ouvrage et affiche sa notation sans commande interactive', () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={creerEtat([ouvrage])}
        ouvrirPreferences={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Couverture de Bel-Ami' })).toHaveStyle({
      width: '80px',
      height: '120px',
    });
    expect(screen.getByText('Notation : 4,5 sur 5')).toBeVisible();
    expect(screen.queryByRole('button', { name: /notation/i })).not.toBeInTheDocument();
  });

  it('distingue une notation absente', () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={creerEtat([{ ...ouvrage, note: null }])}
        ouvrirPreferences={vi.fn()}
      />,
    );

    expect(screen.getByText('Aucune notation')).toBeVisible();
  });
});
