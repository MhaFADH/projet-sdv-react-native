import { useContext, useMemo } from 'react';
import { ThemeContext } from '@/features/preferences/contexte-theme';
import type { Theme } from '@/theme/tokens';

export const useTheme = (): Theme => useContext(ThemeContext);

export const useStylesTheme = <Styles>(creerStyles: (theme: Theme) => Styles): Styles => {
  const theme = useTheme();
  return useMemo(() => creerStyles(theme), [creerStyles, theme]);
};
