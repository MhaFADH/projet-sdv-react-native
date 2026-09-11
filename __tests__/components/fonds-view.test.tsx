import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FondsView } from '../../components/books/fonds-view';
import { creerCoupsDeCoeurInertes } from './outils-fonds';

const ouvrageLu = {
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

const ouvrageNonLu = {
  ...ouvrageLu,
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Germinal',
  auteur: 'Émile Zola',
  editeur: 'Gil Blas',
  annee: 1885,
  lu: false,
};

const creerSelectionVide = () => ({
  identifiants: new Set<string>(),
  basculer: vi.fn(),
  demanderSuppression: vi.fn(),
  suppressionDesactivee: false,
});

describe('présentation du fonds', () => {
  it('affiche un squelette accessible pendant le chargement', () => {
    render(<FondsView ajouterOuvrage={vi.fn()} etat={{ type: 'chargement' }} />);

    expect(screen.getByRole('progressbar', { name: 'Chargement des ouvrages' })).toBeVisible();
    expect(screen.getAllByTestId('ligne-squelette')).toHaveLength(5);
  });

  it('affiche une erreur exploitable et permet de réessayer', () => {
    const reessayer = vi.fn();
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{ type: 'erreur', message: 'Le serveur est injoignable.', reessayer }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Le serveur est injoignable.');
    const boutonReessayer = screen.getByRole('button', { name: 'Réessayer' });
    expect(boutonReessayer).toHaveStyle({ minHeight: '44px' });
    fireEvent.click(boutonReessayer);
    expect(reessayer).toHaveBeenCalledOnce();
  });

  it("explique que le fonds est vide sans proposer d'accès fictif à l'ajout", () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          type: 'succes',
          page: { items: [], page: 1, limit: 20, total: 0, totalPages: 1 },
          pagePrecedente: vi.fn(),
          pageSuivante: vi.fn(),
          ouvrirOuvrage: vi.fn(),
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Le fonds est vide' })).toBeVisible();
    expect(screen.getByText("Aucun ouvrage n'est encore recensé.")).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it("ne confond pas une page devenue vide avec l'ensemble du fonds", () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          type: 'succes',
          page: { items: [], page: 2, limit: 20, total: 20, totalPages: 1 },
          pagePrecedente: vi.fn(),
          pageSuivante: vi.fn(),
          ouvrirOuvrage: vi.fn(),
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
        }}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Le fonds est vide' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Cette page n'est plus disponible" })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Précédent' })).toBeEnabled();
  });

  it('distingue le masquage temporaire d’une page serveur disparue', () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          type: 'succes',
          page: { items: [], page: 1, limit: 20, total: 40, totalPages: 2 },
          pagePrecedente: vi.fn(),
          pageSuivante: vi.fn(),
          ouvrirOuvrage: vi.fn(),
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
          masquageTemporaire: true,
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ouvrages masqués temporairement' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: '0 sélectionnés — Supprimer' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeEnabled();
  });

  it('présente les ouvrages, leur statut collectif et la pagination serveur', () => {
    const pageSuivante = vi.fn();
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          type: 'succes',
          page: {
            items: [ouvrageLu, ouvrageNonLu],
            page: 1,
            limit: 20,
            total: 40,
            totalPages: 2,
          },
          pagePrecedente: vi.fn(),
          pageSuivante,
          ouvrirOuvrage: vi.fn(),
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
        }}
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Bel-Ami')).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    expect(screen.getByText('Victor Havard · 1885')).toBeVisible();
    expect(screen.getByText('Lu')).toBeVisible();
    expect(screen.getByText('Non lu')).toBeVisible();
    expect(screen.getByText('Page 1 sur 2 · 40 ouvrages')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Précédent' })).toBeDisabled();
    const boutonSuivant = screen.getByRole('button', { name: 'Suivant' });
    expect(boutonSuivant).toHaveStyle({ minHeight: '44px' });
    expect(
      screen.queryByRole('switch', { name: /Marquer comme (non )?lu/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('switch', { name: /coup de cœur/ })).toHaveLength(2);

    fireEvent.click(boutonSuivant);
    expect(pageSuivante).toHaveBeenCalledOnce();
  });

  it('empêche de dépasser la dernière page serveur', () => {
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          type: 'succes',
          page: { items: [ouvrageLu], page: 2, limit: 20, total: 40, totalPages: 2 },
          pagePrecedente: vi.fn(),
          pageSuivante: vi.fn(),
          ouvrirOuvrage: vi.fn(),
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Précédent' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();
  });

  it('ouvre la fiche de l’ouvrage choisi depuis la liste', () => {
    const ouvrirOuvrage = vi.fn();
    render(
      <FondsView
        ajouterOuvrage={vi.fn()}
        etat={{
          type: 'succes',
          page: {
            items: [ouvrageLu, ouvrageNonLu],
            page: 1,
            limit: 20,
            total: 40,
            totalPages: 2,
          },
          pagePrecedente: vi.fn(),
          pageSuivante: vi.fn(),
          ouvrirOuvrage,
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
        }}
      />,
    );

    const acces = screen.getByRole('button', { name: 'Germinal, Émile Zola, Non lu' });
    expect(acces).toHaveStyle({ minHeight: '112px' });
    expect(acces.tagName).toBe('BUTTON');
    expect(acces).toHaveAttribute('tabindex', '0');
    acces.focus();
    expect(acces).toHaveFocus();
    fireEvent.click(acces);

    expect(ouvrirOuvrage).toHaveBeenCalledExactlyOnceWith(ouvrageNonLu.id);
  });

  it('propose l’ajout d’un ouvrage, y compris lorsque le fonds est vide', () => {
    const ajouterOuvrage = vi.fn();
    render(
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        etat={{
          type: 'succes',
          page: { items: [], page: 1, limit: 20, total: 0, totalPages: 1 },
          pagePrecedente: vi.fn(),
          pageSuivante: vi.fn(),
          ouvrirOuvrage: vi.fn(),
          coupsDeCoeur: creerCoupsDeCoeurInertes(),
          selection: creerSelectionVide(),
        }}
      />,
    );

    const ajout = screen.getByRole('button', { name: 'Ajouter un ouvrage' });
    expect(screen.getByRole('heading', { name: 'Le fonds est vide' })).toBeVisible();
    expect(ajout).toHaveStyle({ minHeight: '44px' });
    fireEvent.click(ajout);

    expect(ajouterOuvrage).toHaveBeenCalledOnce();
  });
});
