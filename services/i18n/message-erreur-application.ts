import type { TFunction } from 'i18next';
import { type ErreurApplication, STATUT_INDISPONIBLE } from '@/services/api/erreurs';

export const messageErreurApplication = (
  erreur: ErreurApplication,
  t: TFunction,
  messageValidation: string = t('erreursHttp.validation'),
): string => {
  if (erreur.type === 'authentification') return t('erreursHttp.authentification');
  if (erreur.type === 'introuvable') return t('erreursHttp.introuvable');
  if (erreur.type === 'conflit') return t('erreursHttp.conflit');
  if (erreur.type === 'validation') return messageValidation;
  if (erreur.cause === 'annulation') return t('erreursHttp.annulee');
  if (erreur.cause === 'indisponible') {
    return erreur.statut === STATUT_INDISPONIBLE
      ? t('erreursHttp.indisponible')
      : t('erreursHttp.injoignable');
  }
  if (erreur.cause === 'expiration') return t('erreursHttp.injoignable');
  return t('erreursHttp.echec');
};
