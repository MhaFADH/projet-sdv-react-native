import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FondsView } from '../../components/books/fonds-view';
import { Pagination } from '../../components/books/pagination';
import { appliquerLangue } from '../../services/i18n';
import { creerOuvrageTest } from '../fixtures/ouvrage';
import { creerCoupsDeCoeurInertes, illustrerOuvrage } from './outils-fonds';

const ouvrage = creerOuvrageTest({
  titre: 'L’Étranger',
  auteur: 'Albert Camus',
  editeur: 'Gallimard',
  annee: 1942,
  note: 4.5,
});

const etatVide = {
  type: 'succes' as const,
  page: { items: [], page: 1, limit: 20, total: 0, totalPages: 1 },
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

const etatRempli = {
  ...etatVide,
  page: { items: [illustrerOuvrage(ouvrage)], page: 1, limit: 20, total: 1, totalPages: 1 },
};

afterEach(() => appliquerLangue('fr'));

describe('accès aux préférences depuis l’en-tête du fonds', () => {
  it('propose une commande accessible qui ouvre l’écran Préférences', () => {
    const ouvrirPreferences = vi.fn();
    render(
      <FondsView ajouterOuvrage={vi.fn()} etat={etatVide} ouvrirPreferences={ouvrirPreferences} />,
    );

    const acces = screen.getByRole('button', { name: 'Préférences' });
    expect(acces).toHaveStyle({ minHeight: '44px' });

    fireEvent.click(acces);

    expect(ouvrirPreferences).toHaveBeenCalledTimes(1);
  });

  it('traduit l’en-tête du fonds avec la langue active', () => {
    appliquerLangue('en');
    render(<FondsView ajouterOuvrage={vi.fn()} etat={etatVide} ouvrirPreferences={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Book collection' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preferences' })).toBeVisible();
  });

  it('traduit la ligne à chaud sans modifier les contenus métier', async () => {
    render(<FondsView ajouterOuvrage={vi.fn()} etat={etatRempli} ouvrirPreferences={vi.fn()} />);

    expect(screen.getByText('Notation : 4,5 sur 5')).toBeVisible();

    appliquerLangue('en');

    expect(await screen.findByText('Rating: 4.5 out of 5')).toBeVisible();
    expect(screen.getByText('L’Étranger')).toBeVisible();
    expect(screen.getByText('Albert Camus')).toBeVisible();
    expect(screen.getByText('Gallimard · 1942')).toBeVisible();
  });
});

describe('formats d’affichage selon la langue', () => {
  const proprietes = {
    page: 1,
    total: 1500,
    totalPages: 75,
    pagePrecedente: vi.fn(),
    pageSuivante: vi.fn(),
  };

  it('utilise les séparateurs fr-FR en français', () => {
    render(<Pagination {...proprietes} />);

    expect(screen.getByText(/1\D500 ouvrages$/u)).toBeVisible();
    expect(screen.queryByText(/1,500/u)).not.toBeInTheDocument();
  });

  it('utilise les séparateurs en-US en anglais', () => {
    appliquerLangue('en');
    render(<Pagination {...proprietes} />);

    expect(screen.getByText('Page 1 of 75 · 1,500 books')).toBeVisible();
  });
});
