import { describe, expect, it } from 'vitest';
import {
  appliquerIntention,
  libelleActionCoupDeCoeur,
  libelleCoupDeCoeur,
  remplacerOuvrageDansPage,
} from '../../domain/bascule-ouvrage';
import type { Ouvrage, PageOuvrages } from '../../domain/ouvrage';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';
const AUTRE_ID = '7b1f4c0e-2d5a-4e8b-9c31-5a6d8e2f0b14';

const ouvrage: Ouvrage = {
  id: ID,
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

const creerPage = (items: Ouvrage[]): PageOuvrages => ({
  items,
  page: 1,
  limit: 20,
  total: items.length,
  totalPages: 1,
});

describe('application d’une intention de bascule', () => {
  it('remplace le champ visé sans toucher aux autres données serveur', () => {
    const obtenu = appliquerIntention(ouvrage, { id: ID, champ: 'favori', valeur: true });

    expect(obtenu).toEqual({ ...ouvrage, favori: true });
    expect(obtenu.version).toBe(3);
    expect(obtenu.lu).toBe(false);
  });

  it('bascule le statut de lecture sans modifier le coup de cœur', () => {
    const obtenu = appliquerIntention(
      { ...ouvrage, favori: true },
      { id: ID, champ: 'lu', valeur: true },
    );

    expect(obtenu.lu).toBe(true);
    expect(obtenu.favori).toBe(true);
  });

  it('laisse intact un ouvrage qui n’est pas visé par l’intention', () => {
    const obtenu = appliquerIntention(ouvrage, { id: AUTRE_ID, champ: 'favori', valeur: true });

    expect(obtenu).toBe(ouvrage);
  });
});

describe('remplacement d’un ouvrage confirmé dans une page', () => {
  it('remplace uniquement la ligne concernée', () => {
    const autre = { ...ouvrage, id: AUTRE_ID, titre: 'Pierre et Jean' };
    const confirme = { ...ouvrage, favori: true, version: 4 };

    const obtenue = remplacerOuvrageDansPage(creerPage([ouvrage, autre]), confirme);

    expect(obtenue.items).toEqual([confirme, autre]);
    expect(obtenue.total).toBe(2);
  });

  it('conserve la page lorsque l’ouvrage confirmé n’y figure pas', () => {
    const page = creerPage([{ ...ouvrage, id: AUTRE_ID }]);

    expect(remplacerOuvrageDansPage(page, { ...ouvrage, favori: true })).toBe(page);
  });
});

describe('libellés des coups de cœur', () => {
  it('décrit l’état enregistré sans attribution individuelle', () => {
    expect(libelleCoupDeCoeur(true)).toBe('Coup de cœur');
    expect(libelleCoupDeCoeur(false)).toBe('Pas un coup de cœur');
  });

  it('décrit l’action inverse de l’état courant', () => {
    expect(libelleActionCoupDeCoeur(false)).toBe('Marquer comme coup de cœur');
    expect(libelleActionCoupDeCoeur(true)).toBe('Retirer le coup de cœur');
  });

  it('précise l’ouvrage visé lorsque plusieurs cœurs coexistent', () => {
    expect(libelleActionCoupDeCoeur(false, 'Bel-Ami')).toBe('Marquer comme coup de cœur : Bel-Ami');
  });
});
