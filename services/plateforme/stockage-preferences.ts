import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ClePreference, cleStockage } from './cles-preferences';

export const lirePreferenceStockee = async (cle: ClePreference): Promise<string | null> =>
  AsyncStorage.getItem(cleStockage(cle));

export const ecrirePreferenceStockee = async (
  cle: ClePreference,
  valeur: string,
): Promise<void> => {
  await AsyncStorage.setItem(cleStockage(cle), valeur);
};
