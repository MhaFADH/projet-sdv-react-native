import { describe, expect, it } from 'vitest';
import {
  apparenceEffective,
  lireLangue,
  lirePreferenceTheme,
  localeDeLangue,
} from '../../domain/preferences';

describe('préférences globales', () => {
  it('retombe sur les valeurs initiales quand la valeur stockée est absente ou invalide', () => {
    expect(lirePreferenceTheme(undefined)).toBe('systeme');
    expect(lirePreferenceTheme('bleu')).toBe('systeme');
    expect(lireLangue(null)).toBe('fr');
    expect(lireLangue('es')).toBe('fr');
  });

  it('conserve une valeur stockée valide', () => {
    expect(lirePreferenceTheme('sombre')).toBe('sombre');
    expect(lireLangue('en')).toBe('en');
  });

  it('associe une locale de formatage à chaque langue', () => {
    expect(localeDeLangue('fr')).toBe('fr-FR');
    expect(localeDeLangue('en')).toBe('en-US');
  });

  it("ne suit l'apparence du système que lorsque la préférence système est active", () => {
    expect(apparenceEffective('systeme', 'sombre')).toBe('sombre');
    expect(apparenceEffective('systeme', 'clair')).toBe('clair');
    expect(apparenceEffective('clair', 'sombre')).toBe('clair');
    expect(apparenceEffective('sombre', 'clair')).toBe('sombre');
  });
});
