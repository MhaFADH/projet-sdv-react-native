import { afterEach, describe, expect, it, vi } from 'vitest';

const chargerConfiguration = async () => {
  vi.resetModules();
  return (await import('../../services/configuration')).configuration;
};

afterEach(() => vi.unstubAllEnvs());

describe('configuration issue de l’environnement', () => {
  it('applique les valeurs par défaut quand les variables sont absentes', async () => {
    const configuration = await chargerConfiguration();

    expect(configuration.delaiExpirationMs).toBe(10_000);
    expect(configuration.delaiReessaiMs).toBe(1_000);
    expect(configuration.nombreReessaisAutomatiques).toBe(1);
    expect(configuration.dureeToastMs).toBe(5_000);
    expect(configuration.delaiTemporisationMs).toBe(3_000);
    expect(configuration.delaiRechercheMs).toBe(300);
  });

  it('retient la valeur fournie par l’environnement', async () => {
    vi.stubEnv('EXPO_PUBLIC_DELAI_EXPIRATION_MS', '2500');
    vi.stubEnv('EXPO_PUBLIC_NOMBRE_REESSAIS_AUTOMATIQUES', '0');

    const configuration = await chargerConfiguration();

    expect(configuration.delaiExpirationMs).toBe(2_500);
    expect(configuration.nombreReessaisAutomatiques).toBe(0);
  });

  it('revient au défaut quand la variable est vide', async () => {
    vi.stubEnv('EXPO_PUBLIC_DUREE_TOAST_MS', '');

    const configuration = await chargerConfiguration();

    expect(configuration.dureeToastMs).toBe(5_000);
  });

  it('refuse une valeur non entière en nommant la variable', async () => {
    vi.stubEnv('EXPO_PUBLIC_DELAI_RECHERCHE_MS', 'immédiat');

    await expect(chargerConfiguration()).rejects.toThrow('EXPO_PUBLIC_DELAI_RECHERCHE_MS');
  });

  it('refuse une valeur en dessous du minimum autorisé', async () => {
    vi.stubEnv('EXPO_PUBLIC_DELAI_EXPIRATION_MS', '0');

    await expect(chargerConfiguration()).rejects.toThrow('EXPO_PUBLIC_DELAI_EXPIRATION_MS');
  });
});
