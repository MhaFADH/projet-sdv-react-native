import type { Traduire } from '@/hooks/use-traduction';
import type { ErreurApplication } from '@/services/api/erreurs';

export const messageErreurApplication = (
  erreur: ErreurApplication,
  t: Traduire,
  messageValidation: string = t('erreursHttp.validation'),
): string => {
  if (erreur.type === 'authentification') return t('erreursHttp.authentification');
  if (erreur.type === 'introuvable') return t('erreursHttp.introuvable');
  if (erreur.type === 'conflit') return t('erreursHttp.conflit');
  if (erreur.type === 'validation') return messageValidation;
  if (erreur.cause === 'annulation') return t('erreursHttp.annulee');
  if (erreur.cause === 'indisponible') return t('erreursHttp.indisponible');
  if (erreur.cause === 'expiration') return t('erreursHttp.injoignable');
  return t('erreursHttp.echec');
};
