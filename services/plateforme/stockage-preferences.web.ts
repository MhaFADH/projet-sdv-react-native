import { type ClePreference, cleStockage } from './cles-preferences';

const stockage = (): Storage | null => (typeof window === 'undefined' ? null : window.localStorage);

export const lirePreferenceStockee = async (cle: ClePreference): Promise<string | null> =>
  stockage()?.getItem(cleStockage(cle)) ?? null;

export const ecrirePreferenceStockee = async (
  cle: ClePreference,
  valeur: string,
): Promise<void> => {
  stockage()?.setItem(cleStockage(cle), valeur);
};
