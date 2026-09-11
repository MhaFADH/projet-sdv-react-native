import { render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheDetail } from '../../components/books/fiche-detail';
import { FormulaireOuvrageView } from '../../components/books/formulaire-ouvrage-view';
import {
  type OuvrageSaisi,
  SAISIE_OUVRAGE_VIDE,
  type SaisieOuvrage,
} from '../../domain/saisie-ouvrage';
import { PreferencesProvider } from '../../features/preferences/preferences-provider';
import { appliquerLangue } from '../../services/i18n';

const ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8401',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

const detail = {
  ouvrage,
  basculeEnCours: false,
  basculerCoupDeCoeur: vi.fn(),
  basculerStatut: vi.fn(),
  demanderSuppression: vi.fn(),
  suppressionDesactivee: false,
  corriger: vi.fn(),
};

const SURFACE_CLAIRE = 'rgb(255, 255, 255)';
const SURFACE_SOMBRE = 'rgb(34, 29, 24)';

afterEach(() => appliquerLangue('fr'));

describe('fiche d’un ouvrage', () => {
  it('traduit ses libellés et laisse les contenus métier intacts', () => {
    appliquerLangue('en');
    render(<FicheDetail {...detail} />);

    expect(screen.getByText('Author')).toBeVisible();
    expect(screen.getByText('Publisher')).toBeVisible();
    expect(screen.getByText('Publication year')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit this book' })).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Mark as read' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    expect(screen.getByText('Victor Havard')).toBeVisible();
  });

  it('suit le thème sombre choisi', async () => {
    window.localStorage.setItem('booklist-pro.preferences.theme', 'sombre');
    render(
      <PreferencesProvider>
        <FicheDetail {...detail} />
      </PreferencesProvider>,
    );

    const carte = (await screen.findByRole('heading', { name: 'Bel-Ami' })).parentElement;
    await waitFor(() => expect(carte).toHaveStyle({ backgroundColor: SURFACE_SOMBRE }));
    window.localStorage.clear();
  });
});

describe('formulaire d’un ouvrage', () => {
  const proprietes = {
    titre: 'Ajouter un ouvrage',
    libelleQuitter: '← Retour au fonds',
    libelleEnregistrer: 'Enregistrer l’ouvrage',
    enEnvoi: false,
    enregistrer: vi.fn(),
    quitter: vi.fn(),
    confirmationAbandon: { confirmer: vi.fn(), poursuivre: vi.fn() },
    avis: null,
    toast: null,
  };

  it('traduit ses champs et sa confirmation d’abandon', () => {
    appliquerLangue('en');
    render(<FormulaireOuvrageViewControle {...proprietes} />);

    expect(screen.getByRole('heading', { name: 'Discard this entry?' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeVisible();
    expect(screen.getByText('Title')).toBeVisible();
    expect(screen.getByText('Publisher (optional)')).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Reading status' })).toBeVisible();
  });

  it('rend ses champs sur la surface claire par défaut', () => {
    render(<FormulaireOuvrageViewControle {...proprietes} />);

    expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveStyle({
      backgroundColor: SURFACE_CLAIRE,
    });
  });
});

const FormulaireOuvrageViewControle = (
  proprietes: Omit<Parameters<typeof FormulaireOuvrageView>[0], 'controle'>,
) => {
  const formulaire = useForm<SaisieOuvrage, unknown, OuvrageSaisi>({
    defaultValues: SAISIE_OUVRAGE_VIDE,
  });
  return <FormulaireOuvrageView {...proprietes} controle={formulaire.control} />;
};
