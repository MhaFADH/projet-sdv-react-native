import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import type { Ouvrage } from '../../domain/ouvrage';
import { FicheScreen } from '../../features/books/fiche-screen';
import { creerEnveloppeOuvrages } from '../outils-rendu';

export const ID = '33575fa9-7968-45b3-8447-ec994a0b8401';
export const AUTRE_ID = '7b1f4c0e-2d5a-4e8b-9c31-5a6d8e2f0b14';

export const ouvrage: Ouvrage = {
  id: ID,
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: '',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

export const reponseJson = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), { status: statut });

export const rendreFiche = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<FicheScreen corriger={vi.fn()} id={ID} retour={vi.fn()} />, {
    wrapper: creerEnveloppeOuvrages(client),
  });
  return client;
};
