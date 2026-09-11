import { describe, expect, it } from 'vitest';
import { appliquerNotation } from '../../domain/notation-ouvrage';
import type { Ouvrage } from '../../domain/ouvrage';
import { conserverOuvragePlusRecent, conserverVersionsPage } from '../../domain/ouvrage';

const ouvrage: Ouvrage = {
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

describe('notation d’un ouvrage', () => {
  it.each([0, 5] as const)('applique la valeur limite %i au seul ouvrage visé', (valeur) => {
    expect(appliquerNotation(ouvrage, { id: ouvrage.id, valeur }).note).toBe(valeur);
    expect(appliquerNotation(ouvrage, { id: 'autre', valeur })).toBe(ouvrage);
  });

  it('conserve les versions les plus récentes face à une relecture obsolète', () => {
    const confirme = { ...ouvrage, note: 5, version: 4 };
    const pageConfirmee = { items: [confirme], page: 1, limit: 20, total: 1, totalPages: 1 };
    const pageObsolete = { ...pageConfirmee, items: [ouvrage] };

    expect(conserverOuvragePlusRecent(confirme, ouvrage)).toBe(confirme);
    expect(conserverVersionsPage(pageConfirmee, pageObsolete).items[0]).toBe(confirme);
  });
});
