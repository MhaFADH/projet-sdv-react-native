import { PreferencesView } from '@/components/preferences/preferences-view';
import { usePreferences } from '@/hooks/use-preferences';

type PreferencesScreenProps = {
  revenir: () => void;
};

export const PreferencesScreen = ({ revenir }: PreferencesScreenProps) => {
  const {
    preferenceTheme,
    langue,
    stockageEchoue,
    choisirTheme,
    choisirLangue,
    reessayerStockage,
  } = usePreferences();

  return (
    <PreferencesView
      choisirLangue={choisirLangue}
      choisirTheme={choisirTheme}
      stockageEchoue={stockageEchoue}
      langue={langue}
      preferenceTheme={preferenceTheme}
      reessayerStockage={reessayerStockage}
      revenir={revenir}
    />
  );
};
