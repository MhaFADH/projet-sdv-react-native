export type ClePreference = 'theme' | 'langue';

const PREFIXE = 'booklist-pro.preferences.';

export const cleStockage = (cle: ClePreference): string => `${PREFIXE}${cle}`;
