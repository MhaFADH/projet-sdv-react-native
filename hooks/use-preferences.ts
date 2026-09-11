import { useContext } from 'react';
import {
  type ContextePreferences,
  PreferencesContext,
} from '@/features/preferences/contexte-preferences';

export const usePreferences = (): ContextePreferences => {
  const preferences = useContext(PreferencesContext);
  if (!preferences) throw new Error('PreferencesProvider est requis pour lire les préférences.');
  return preferences;
};
