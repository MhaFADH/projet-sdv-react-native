import { createContext } from 'react';
import type { OuvrageASupprimer } from '@/domain/groupe-suppressions';

export type ContexteSuppressions = {
  confirmerSuppressions: (ouvrages: OuvrageASupprimer[]) => void;
  estMasque: (id: string) => boolean;
  suppressionDesactivee: boolean;
};

export const SuppressionsContext = createContext<ContexteSuppressions | null>(null);
