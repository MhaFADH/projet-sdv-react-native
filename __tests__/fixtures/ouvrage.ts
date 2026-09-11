import type { Ouvrage } from '../../domain/ouvrage';

const OUVRAGE_PAR_DEFAUT: Ouvrage = {
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

export const creerOuvrageTest = (remplacements: Partial<Ouvrage> = {}): Ouvrage => ({
  ...OUVRAGE_PAR_DEFAUT,
  ...remplacements,
});
