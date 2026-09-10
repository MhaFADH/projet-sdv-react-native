import { describe, expect, it } from 'vitest';
import { lireNumeroPage, PREMIERE_PAGE } from '../../domain/ouvrage';

describe('numéro de page demandé', () => {
  it('accepte un numéro de page entier positif', () => {
    expect(lireNumeroPage('7')).toBe(7);
    expect(lireNumeroPage([' 12 '])).toBe(12);
  });

  it('retombe sur la première page pour une valeur inutilisable', () => {
    const valeursRefusees = [undefined, '', 'deux', '2.5', '-3', '0', 'NaN'];
    for (const valeur of valeursRefusees) {
      expect(lireNumeroPage(valeur)).toBe(PREMIERE_PAGE);
    }
  });
});
