import { useContext } from 'react';
import { BasculesContext, type ContexteBascules } from '@/features/books/contexte-bascules';

export const useBascules = (): ContexteBascules => {
  const contexte = useContext(BasculesContext);
  if (!contexte) throw new Error('Le contexte des bascules est absent.');
  return contexte;
};
