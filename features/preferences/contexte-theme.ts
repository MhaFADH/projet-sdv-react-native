import { createContext } from 'react';
import { type Theme, theme } from '@/theme/tokens';

export const ThemeContext = createContext<Theme>(theme);
