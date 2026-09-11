import { useTraduction } from './use-traduction';

export const useLibelleReessai = (): ((secondesRestantes: number, immediat: string) => string) => {
  const t = useTraduction();

  return (secondesRestantes, immediat) =>
    secondesRestantes > 0
      ? t('ecriture.reessaiTemporise', { secondes: secondesRestantes })
      : immediat;
};
