import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FicheView } from '../../components/books/fiche-view';

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

describe('présentation de la fiche', () => {
  it('affiche un squelette accessible pendant le chargement', () => {
    render(<FicheView etat={{ type: 'chargement' }} retour={vi.fn()} />);

    expect(screen.getByRole('progressbar', { name: 'Chargement de la fiche' })).toBeVisible();
    expect(screen.getAllByTestId('ligne-squelette')).toHaveLength(3);
  });

  it('affiche une erreur exploitable et permet de réessayer', () => {
    const reessayer = vi.fn();
    render(
      <FicheView
        etat={{ type: 'erreur', message: 'Le serveur est injoignable.', reessayer }}
        retour={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Le serveur est injoignable.');
    const boutonReessayer = screen.getByRole('button', { name: 'Réessayer' });
    expect(boutonReessayer).toHaveStyle({ minHeight: '44px' });
    fireEvent.click(boutonReessayer);
    expect(reessayer).toHaveBeenCalledOnce();
  });

  it("contextualise l'absence de fiche sans inventer de contenu", () => {
    render(
      <FicheView etat={{ type: 'introuvable', message: 'Livre inconnu.' }} retour={vi.fn()} />,
    );

    expect(
      screen.getByRole('heading', { name: "Cette fiche n'est plus disponible" }),
    ).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Livre inconnu.');
    expect(screen.queryByText('Auteur')).not.toBeInTheDocument();
  });

  it("présente l'édition consultée et un retour au fonds accessible", () => {
    const retour = vi.fn();
    render(<FicheView etat={{ type: 'succes', ouvrage }} retour={retour} />);

    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(screen.getByText('Guy de Maupassant')).toBeVisible();
    expect(screen.getByText('Victor Havard')).toBeVisible();
    expect(screen.getByText('1885')).toBeVisible();
    expect(screen.getByText('Lu')).toBeVisible();

    const boutonRetour = screen.getByRole('button', { name: 'Retour au fonds' });
    expect(boutonRetour).toHaveStyle({ minHeight: '44px' });
    expect(boutonRetour).toHaveAttribute('tabindex', '0');
    boutonRetour.focus();
    expect(boutonRetour).toHaveFocus();
    fireEvent.click(boutonRetour);
    expect(retour).toHaveBeenCalledOnce();
  });

  it("reste valide lorsque l'éditeur accepté par le contrat est vide", () => {
    render(
      <FicheView
        etat={{ type: 'succes', ouvrage: { ...ouvrage, editeur: '' } }}
        retour={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(screen.getByText('Éditeur non renseigné')).toBeVisible();
  });

  it('annonce un statut de lecture négatif sans le déguiser', () => {
    render(
      <FicheView etat={{ type: 'succes', ouvrage: { ...ouvrage, lu: false } }} retour={vi.fn()} />,
    );

    expect(screen.getByText('Non lu')).toBeVisible();
  });
});
