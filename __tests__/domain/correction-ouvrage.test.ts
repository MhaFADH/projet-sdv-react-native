import { describe, expect, it } from 'vitest';
import { correctionOuvrage, saisieDepuisOuvrage } from '../../domain/saisie-ouvrage';

const ouvrage = {
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Havard',
  annee: 1885,
  lu: false,
};

describe('correction d’un ouvrage', () => {
  it('préremplit la saisie avec l’année en texte et le statut du serveur', () => {
    expect(saisieDepuisOuvrage({ ...ouvrage, lu: true })).toEqual({
      titre: 'Bel-Ami',
      auteur: 'Guy de Maupassant',
      editeur: 'Havard',
      annee: '1885',
      lu: true,
    });
  });

  it('ne retient que les champs réellement modifiés', () => {
    expect(correctionOuvrage(ouvrage, { ...ouvrage, titre: 'Bel Ami' })).toEqual({
      titre: 'Bel Ami',
    });
  });

  it('ne renvoie aucun champ lorsque la saisie est identique au serveur', () => {
    expect(correctionOuvrage(ouvrage, { ...ouvrage })).toEqual({});
  });

  it('accepte un éditeur vidé et un statut rebasculé sans les confondre', () => {
    expect(correctionOuvrage(ouvrage, { ...ouvrage, editeur: '', lu: true })).toEqual({
      editeur: '',
      lu: true,
    });
  });
});
