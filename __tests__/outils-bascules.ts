import { waitFor } from '@testing-library/react';
import { expect, type vi } from 'vitest';
import type { Ouvrage } from '../domain/ouvrage';

export type Transport = ReturnType<typeof vi.fn<typeof fetch>>;

export const belAmi: Ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8401',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: false,
  favori: false,
  note: 4,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 3,
};

export const germinal: Ouvrage = {
  ...belAmi,
  id: '7b1f4c0e-2d5a-4e8b-9c31-5a6d8e2f0b14',
  titre: 'Germinal',
  auteur: 'Émile Zola',
  favori: true,
};

export const estPatch = (initialisation?: RequestInit) => initialisation?.method === 'PATCH';

export const appelsPatch = (transport: Transport) =>
  transport.mock.calls.filter(([, initialisation]) => estPatch(initialisation));

export const attendrePatch = (transport: Transport, nombre = 1) =>
  waitFor(() => expect(appelsPatch(transport)).toHaveLength(nombre));

export const reponsePage = (items: Ouvrage[]) =>
  new Response(JSON.stringify({ items, page: 1, limit: 20, total: items.length, totalPages: 1 }), {
    status: 200,
  });

export const reponseRefus = () =>
  new Response(JSON.stringify({ erreur: 'refus', message: 'Modification refusée.' }), {
    status: 422,
  });

export const reponseNotesVides = () => new Response(JSON.stringify([]), { status: 200 });

export const estNotes = (entree: RequestInfo | URL) => String(entree).endsWith('/notes');
