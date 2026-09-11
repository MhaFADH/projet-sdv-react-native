import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  type ApparenceEffective,
  apparenceEffective,
  LANGUE_INITIALE,
  type Langue,
  lireLangue,
  lirePreferenceTheme,
  PREFERENCE_THEME_INITIALE,
  type PreferenceTheme,
} from '@/domain/preferences';
import { appliquerLangue } from '@/services/i18n';
import type { ClePreference } from '@/services/plateforme/cles-preferences';
import {
  ecrirePreferenceStockee,
  lirePreferenceStockee,
} from '@/services/plateforme/stockage-preferences';
import { creerTheme } from '@/theme/tokens';
import { type ContextePreferences, PreferencesContext } from './contexte-preferences';
import { ThemeContext } from './contexte-theme';

type Choix = { preferenceTheme: PreferenceTheme; langue: Langue };
type ChampChoix = keyof Choix;

const CLES_STOCKAGE: Record<ChampChoix, ClePreference> = {
  preferenceTheme: 'theme',
  langue: 'langue',
};

const CHOIX_INITIAUX: Choix = {
  preferenceTheme: PREFERENCE_THEME_INITIALE,
  langue: LANGUE_INITIALE,
};

const restaurerChoix = async (): Promise<Choix> => {
  const [themeStocke, langueStockee] = await Promise.all([
    lirePreferenceStockee('theme'),
    lirePreferenceStockee('langue'),
  ]);
  return {
    preferenceTheme: lirePreferenceTheme(themeStocke),
    langue: lireLangue(langueStockee),
  };
};

const ecrireChoix = async (choix: Choix, champs: readonly ChampChoix[]): Promise<void> => {
  await Promise.all(
    champs.map((champ) => ecrirePreferenceStockee(CLES_STOCKAGE[champ], choix[champ])),
  );
};

const champsDe = (modification: Partial<Choix>): ChampChoix[] =>
  Object.keys(modification) as ChampChoix[];

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const [choix, setChoix] = useState<Choix>(CHOIX_INITIAUX);
  const [stockageEchoue, setStockageEchoue] = useState(false);
  const champsExplicites = useRef<Set<ChampChoix>>(new Set());
  const apparenceSysteme: ApparenceEffective = useColorScheme() === 'dark' ? 'sombre' : 'clair';

  const enregistrer = useCallback((aEnregistrer: Choix, champs: readonly ChampChoix[]) => {
    void ecrireChoix(aEnregistrer, champs).then(
      () => setStockageEchoue(false),
      () => setStockageEchoue(true),
    );
  }, []);

  useEffect(() => {
    let monte = true;
    void restaurerChoix().then(
      (restaures) => {
        if (!monte) return;
        const explicites = champsExplicites.current;
        setChoix((courant) => ({
          preferenceTheme: explicites.has('preferenceTheme')
            ? courant.preferenceTheme
            : restaures.preferenceTheme,
          langue: explicites.has('langue') ? courant.langue : restaures.langue,
        }));
        if (!explicites.has('langue')) appliquerLangue(restaures.langue);
      },
      () => {
        if (monte) setStockageEchoue(true);
      },
    );
    return () => {
      monte = false;
    };
  }, []);

  const appliquer = useCallback(
    (modification: Partial<Choix>) => {
      const champs = champsDe(modification);
      const suivant = { ...choix, ...modification };
      for (const champ of champs) champsExplicites.current.add(champ);
      setChoix(suivant);
      if (modification.langue) appliquerLangue(modification.langue);
      enregistrer(suivant, champs);
    },
    [choix, enregistrer],
  );

  const apparence = apparenceEffective(choix.preferenceTheme, apparenceSysteme);
  const theme = useMemo(() => creerTheme(apparence), [apparence]);

  const preferences = useMemo<ContextePreferences>(
    () => ({
      preferenceTheme: choix.preferenceTheme,
      langue: choix.langue,
      apparence,
      stockageEchoue,
      choisirTheme: (preferenceTheme) => appliquer({ preferenceTheme }),
      choisirLangue: (langue) => appliquer({ langue }),
      reessayerStockage: () => enregistrer(choix, champsDe(choix)),
    }),
    [apparence, appliquer, choix, enregistrer, stockageEchoue],
  );

  return (
    <PreferencesContext.Provider value={preferences}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </PreferencesContext.Provider>
  );
};
