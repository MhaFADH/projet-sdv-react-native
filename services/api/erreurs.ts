import { z } from 'zod';

export const STATUT_INDISPONIBLE = 503;
export const STATUT_ERREUR_SERVEUR_MINIMALE = 500;

const STATUT_HTTP = {
  nonAuthentifie: 401,
  interdit: 403,
  introuvable: 404,
  conflit: 409,
  validation: 422,
  indisponible: STATUT_INDISPONIBLE,
  erreurServeurMinimale: STATUT_ERREUR_SERVEUR_MINIMALE,
} as const;

const reponseErreurSchema = z.object({
  erreur: z.string(),
  message: z.string().optional(),
  champs: z.record(z.string(), z.string()).optional(),
  serveur: z.unknown().optional(),
  versionAttendue: z.number().int().optional(),
});

export type ErreurApplication =
  | {
      type: 'reseau';
      cause: 'annulation' | 'indisponible' | 'expiration' | 'http';
      message: string;
      reessayable: boolean;
      statut?: number;
    }
  | {
      type: 'introuvable';
      message: string;
    }
  | {
      type: 'validation';
      message: string;
      champs?: Record<string, string>;
    }
  | {
      type: 'conflit';
      message: string;
      serveur?: unknown;
      versionAttendue?: number;
    }
  | {
      type: 'authentification';
      message: string;
      statut: 401 | 403;
    };

export const traduireErreurHttp = (statut: number, corps: unknown): ErreurApplication => {
  const resultat = reponseErreurSchema.safeParse(corps);
  const messageServeur = resultat.success ? resultat.data.message : undefined;

  if (statut === STATUT_HTTP.nonAuthentifie || statut === STATUT_HTTP.interdit) {
    return {
      type: 'authentification',
      message: messageServeur ?? 'Authentification requise.',
      statut,
    };
  }

  if (statut === STATUT_HTTP.introuvable) {
    return {
      type: 'introuvable',
      message: messageServeur ?? "Cet ouvrage n'existe pas ou plus.",
    };
  }

  if (statut === STATUT_HTTP.conflit) {
    return {
      type: 'conflit',
      message: messageServeur ?? 'Cet ouvrage a été modifié entre-temps.',
      serveur: resultat.success ? resultat.data.serveur : undefined,
      versionAttendue: resultat.success ? resultat.data.versionAttendue : undefined,
    };
  }

  if (statut === STATUT_HTTP.validation) {
    return {
      type: 'validation',
      message: messageServeur ?? 'Certaines données sont invalides.',
      champs: resultat.success ? resultat.data.champs : undefined,
    };
  }

  return {
    type: 'reseau',
    cause: statut === STATUT_HTTP.indisponible ? 'indisponible' : 'http',
    message:
      messageServeur ??
      (statut === STATUT_HTTP.indisponible
        ? 'Le service est temporairement indisponible.'
        : 'La requête a échoué.'),
    reessayable: statut === STATUT_HTTP.indisponible || statut >= STATUT_HTTP.erreurServeurMinimale,
    statut,
  };
};

const TYPES_ERREUR = ['reseau', 'introuvable', 'validation', 'conflit', 'authentification'];

export const estErreurApplication = (cause: unknown): cause is ErreurApplication =>
  typeof cause === 'object' &&
  cause !== null &&
  'type' in cause &&
  typeof (cause as { type: unknown }).type === 'string' &&
  TYPES_ERREUR.includes((cause as { type: string }).type);

export const creerErreurValidation = (message: string): ErreurApplication => ({
  type: 'validation',
  message,
});
