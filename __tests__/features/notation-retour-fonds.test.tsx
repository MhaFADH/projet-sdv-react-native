import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONSULTATION_FONDS_PAR_DEFAUT } from '../../domain/criteres-ouvrages';
import { FicheScreen } from '../../features/books/fiche-screen';
import { FondsScreen } from '../../features/books/fonds-screen';
import { creerEnveloppeOuvrages } from '../outils-rendu';
import { ID, ouvrage, reponseJson } from './outils-notation';

const ParcoursFicheFonds = () => {
  const [ficheVisible, setFicheVisible] = useState(true);
  if (ficheVisible) {
    return <FicheScreen corriger={vi.fn()} id={ID} retour={() => setFicheVisible(false)} />;
  }
  return (
    <FondsScreen
      ajouterOuvrage={vi.fn()}
      changerConsultation={vi.fn()}
      changerPage={vi.fn()}
      consultationDemandee={CONSULTATION_FONDS_PAR_DEFAUT}
      ouvrirOuvrage={vi.fn()}
      ouvrirPreferences={vi.fn()}
      pageDemandee={1}
    />
  );
};

afterEach(() => vi.unstubAllGlobals());

describe('retour au fonds après une notation', () => {
  it('ne déplace pas le réessai d’une notation refusée dans la liste', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      const chemin = new URL(String(entree)).pathname;
      if (chemin.endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') {
        return Promise.resolve(
          reponseJson({ erreur: 'refus', message: 'Modification refusée.' }, 422),
        );
      }
      if (chemin === `/books/${ID}`) return Promise.resolve(reponseJson(ouvrage));
      return Promise.resolve(
        reponseJson({ items: [ouvrage], page: 1, limit: 20, total: 1, totalPages: 1 }),
      );
    });
    vi.stubGlobal('fetch', transport);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<ParcoursFicheFonds />, { wrapper: creerEnveloppeOuvrages(client) });

    fireEvent.click(await screen.findByRole('radio', { name: 'Attribuer 4 étoiles' }));
    expect(await screen.findByRole('button', { name: 'Réessayer la notation' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));

    expect(await screen.findByRole('heading', { name: 'Fonds des ouvrages' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Réessayer la notation' })).not.toBeInTheDocument();
    client.clear();
  });
});
