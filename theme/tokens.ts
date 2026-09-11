import type { ApparenceEffective } from '@/domain/preferences';
import { PALETTES, type Palette } from './palettes';

const tokensPartages = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
  },
  typography: {
    caption: 14,
    metadata: 15,
    body: 16,
    itemTitle: 20,
    sectionTitle: 24,
    pageTitle: 32,
    bodyLineHeight: 24,
    overlineLetterSpacing: 0.5,
  },
  layout: {
    contentMaxWidth: 960,
    dialogMaxWidth: 560,
    cardMinHeight: 112,
    cardTextMinWidth: 200,
    paginationButtonMinWidth: 112,
    compactBreakpoint: 768,
    criteriaLabelWidth: 160,
  },
  borderWidth: 1,
  minTargetSize: 44,
} as const;

export type Theme = typeof tokensPartages & { colors: Palette };

export const creerTheme = (apparence: ApparenceEffective): Theme => ({
  ...tokensPartages,
  colors: PALETTES[apparence],
});

export const theme = creerTheme('clair');
