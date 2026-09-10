import { describe, expect, it } from 'vitest';
import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  consultationsEgales,
  creerCriteresOuvrages,
  encoderConsultation,
  lireFiltreLecture,
  lireFiltreRecommandation,
  lireOrdreFonds,
  lireRecherche,
  lireTriFonds,
} from '../../domain/criteres-ouvrages';

describe('critères de consultation du fonds', () => {
  it('construit les critères serveur actifs', () => {
    expect(
      creerCriteresOuvrages(3, {
        recherche: 'zola',
        lecture: 'lu',
        recommandation: 'favoris',
        tri: 'note',
        ordre: 'desc',
      }),
    ).toEqual({
      page: 3,
      limit: 20,
      q: 'zola',
      status: 'lu',
      favori: true,
      sort: 'note',
      order: 'desc',
    });
  });

  it('encode uniquement les paramètres non définis par défaut', () => {
    expect(
      encoderConsultation({
        recherche: 'zola',
        lecture: 'nonlu',
        recommandation: 'favoris',
        tri: 'auteur',
        ordre: 'desc',
      }),
    ).toEqual({ q: 'zola', status: 'nonlu', favori: 'true', sort: 'auteur', order: 'desc' });
    expect(encoderConsultation(CONSULTATION_FONDS_PAR_DEFAUT)).toEqual({
      q: undefined,
      status: undefined,
      favori: undefined,
      sort: undefined,
      order: undefined,
    });
  });

  it('compare toutes les dimensions de deux consultations', () => {
    expect(consultationsEgales(CONSULTATION_FONDS_PAR_DEFAUT, CONSULTATION_FONDS_PAR_DEFAUT)).toBe(
      true,
    );
    expect(
      consultationsEgales(CONSULTATION_FONDS_PAR_DEFAUT, {
        ...CONSULTATION_FONDS_PAR_DEFAUT,
        ordre: 'desc',
      }),
    ).toBe(false);
  });

  it('omet les filtres Tous et conserve le tri par défaut', () => {
    expect(creerCriteresOuvrages(1, CONSULTATION_FONDS_PAR_DEFAUT)).toEqual({
      page: 1,
      limit: 20,
      q: '',
      status: undefined,
      favori: undefined,
      sort: 'titre',
      order: 'asc',
    });
  });

  it('lit les valeurs valides, y compris le premier paramètre répété', () => {
    expect(lireRecherche(['zola', 'hugo'])).toBe('zola');
    expect(lireFiltreLecture(['nonlu', 'lu'])).toBe('nonlu');
    expect(lireFiltreRecommandation(['true', 'false'])).toBe('favoris');
    expect(lireTriFonds(['annee', 'titre'])).toBe('annee');
    expect(lireOrdreFonds(['desc', 'asc'])).toBe('desc');
  });

  it('remplace les valeurs absentes ou invalides par les valeurs par défaut', () => {
    expect(lireRecherche(undefined)).toBe('');
    expect(lireFiltreLecture('invalide')).toBe('tous');
    expect(lireFiltreRecommandation('false')).toBe('toutes');
    expect(lireTriFonds('updatedAt')).toBe('titre');
    expect(lireOrdreFonds('invalide')).toBe('asc');
  });
});
