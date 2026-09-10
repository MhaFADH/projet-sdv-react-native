import { useContext } from 'react';
import {
  type ContexteSuppressions,
  SuppressionsContext,
} from '@/features/books/contexte-suppressions';

export const useSuppressions = (): ContexteSuppressions => {
  const contexte = useContext(SuppressionsContext);
  if (!contexte) throw new Error('Le contexte des suppressions est absent.');
  return contexte;
};
