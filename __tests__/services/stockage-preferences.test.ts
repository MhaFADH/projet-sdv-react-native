import { beforeEach, describe, expect, it } from 'vitest';
import {
  ecrirePreferenceStockee,
  lirePreferenceStockee,
} from '../../services/plateforme/stockage-preferences';

beforeEach(() => window.localStorage.clear());

describe('stockage des préférences sur navigateur', () => {
  it('signale une préférence absente sans échouer', async () => {
    await expect(lirePreferenceStockee('theme')).resolves.toBeNull();
  });

  it('relit une préférence enregistrée sous une clé préfixée', async () => {
    await ecrirePreferenceStockee('langue', 'en');

    expect(window.localStorage.getItem('booklist-pro.preferences.langue')).toBe('en');
    await expect(lirePreferenceStockee('langue')).resolves.toBe('en');
  });

  it('conserve les deux préférences indépendamment', async () => {
    await ecrirePreferenceStockee('theme', 'sombre');
    await ecrirePreferenceStockee('langue', 'fr');

    await expect(lirePreferenceStockee('theme')).resolves.toBe('sombre');
    await expect(lirePreferenceStockee('langue')).resolves.toBe('fr');
  });
});
