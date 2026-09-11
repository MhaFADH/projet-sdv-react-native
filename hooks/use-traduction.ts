import { useTranslation } from 'react-i18next';
import '@/services/i18n';

export type Traduire = ReturnType<typeof useTranslation>['t'];

export const useTraduction = (): Traduire => useTranslation().t;

export const useLangueActive = (): string => useTranslation().i18n.language;
