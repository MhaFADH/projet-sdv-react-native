import { configuration } from '@/services/configuration';
import { traduire } from '@/services/i18n';
import { creerErreurValidation, type ErreurApplication, traduireErreurHttp } from './erreurs';
import { construireUrlApi } from './url-api';

const EN_TETES_JSON = { Accept: 'application/json' } as const;
const EN_TETES_ENVOI_JSON = { ...EN_TETES_JSON, 'Content-Type': 'application/json' } as const;

type ParametreRequete = string | number | boolean | undefined;

type OptionsRequete = {
  parametres?: Record<string, ParametreRequete>;
  signal?: AbortSignal;
};

type OptionsEcriture = {
  signal?: AbortSignal;
};

type RequeteHttp = {
  chemin: string;
  methode: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  parametres?: Record<string, ParametreRequete>;
  corps?: unknown;
  signal?: AbortSignal;
};

type ResultatRequete = {
  corps: unknown;
  statut: number;
};

const lireCorps = async (reponse: Response): Promise<unknown> => {
  const texte = await reponse.text();
  if (!texte) return undefined;

  try {
    return JSON.parse(texte);
  } catch {
    return undefined;
  }
};

const erreurTransport = (expiree: boolean, annulee: boolean): ErreurApplication => {
  if (expiree) {
    return {
      type: 'reseau',
      cause: 'expiration',
      message: traduire('erreursHttp.expiration'),
      reessayable: true,
    };
  }

  if (annulee) {
    return {
      type: 'reseau',
      cause: 'annulation',
      message: traduire('erreursHttp.annulee'),
      reessayable: false,
    };
  }

  return {
    type: 'reseau',
    cause: 'indisponible',
    message: traduire('erreursHttp.injoignable'),
    reessayable: true,
  };
};

const executer = async ({
  chemin,
  methode,
  parametres = {},
  corps,
  signal,
}: RequeteHttp): Promise<ResultatRequete> => {
  const url = construireUrlApi(chemin, parametres);
  const controleur = new AbortController();
  let expiree = false;
  const annuler = () => controleur.abort(signal?.reason);

  if (signal?.aborted) annuler();
  signal?.addEventListener('abort', annuler, { once: true });
  const expiration = setTimeout(() => {
    expiree = true;
    controleur.abort();
  }, configuration.delaiExpirationMs);

  let reponse: Response;
  let reponseCorps: unknown;
  try {
    reponse = await fetch(url, {
      method: methode,
      headers: methode === 'GET' || methode === 'DELETE' ? EN_TETES_JSON : EN_TETES_ENVOI_JSON,
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: controleur.signal,
    });
    reponseCorps = await lireCorps(reponse);
  } catch {
    throw erreurTransport(expiree, signal?.aborted ?? false);
  } finally {
    clearTimeout(expiration);
    signal?.removeEventListener('abort', annuler);
  }

  if (!reponse.ok) throw traduireErreurHttp(reponse.status, reponseCorps);
  return { corps: reponseCorps, statut: reponse.status };
};

const get = async (chemin: string, options: OptionsRequete = {}): Promise<unknown> =>
  (await executer({ chemin, methode: 'GET', ...options })).corps;

const post = async (
  chemin: string,
  corps: unknown,
  options: OptionsEcriture = {},
): Promise<unknown> =>
  (await executer({ chemin, methode: 'POST', corps, signal: options.signal })).corps;

const patch = async (
  chemin: string,
  corps: unknown,
  options: OptionsEcriture = {},
): Promise<unknown> =>
  (await executer({ chemin, methode: 'PATCH', corps, signal: options.signal })).corps;

const supprimer = async (chemin: string, options: OptionsEcriture = {}): Promise<void> => {
  const resultat = await executer({ chemin, methode: 'DELETE', signal: options.signal });
  if (resultat.statut !== 204 || resultat.corps !== undefined) {
    throw creerErreurValidation(traduire('erreursHttp.reponseSuppression'));
  }
};

export const clientHttp = { get, post, patch, supprimer };
