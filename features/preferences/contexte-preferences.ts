import { createContext } from 'react';
import type { ApparenceEffective, Langue, PreferenceTheme } from '@/domain/preferences';

export type ContextePreferences = {
  preferenceTheme: PreferenceTheme;
  langue: Langue;
  apparence: ApparenceEffective;
  stockageEchoue: boolean;
  choisirTheme: (preference: PreferenceTheme) => void;
  choisirLangue: (langue: Langue) => void;
  reessayerStockage: () => void;
};

export const PreferencesContext = createContext<ContextePreferences | null>(null);
