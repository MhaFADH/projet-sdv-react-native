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

type OptionsRequeteUrl = {
  delaiExpirationMs: number;
  signal?: AbortSignal;
  transport?: TransportHttp;
};

type OptionsEcriture = {
  signal?: AbortSignal;
};

type RequeteHttp = {
  url: string;
  methode: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  corps?: unknown;
  delaiExpirationMs?: number;
  signal?: AbortSignal;
  transport?: TransportHttp;
};

type ResultatRequete = {
  corps: unknown;
  statut: number;
};

export type TransportHttp = (url: string, initialisation: RequestInit) => Promise<Response>;

const transportParDefaut: TransportHttp = (url, initialisation) => fetch(url, initialisation);

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
      message: "Le délai d'attente de la requête est dépassé.",
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
  url,
  methode,
  corps,
  delaiExpirationMs = configuration.delaiExpirationMs,
  signal,
  transport = transportParDefaut,
}: RequeteHttp): Promise<ResultatRequete> => {
  const controleur = new AbortController();
  let expiree = false;
  const annuler = () => controleur.abort(signal?.reason);

  if (signal?.aborted) annuler();
  signal?.addEventListener('abort', annuler, { once: true });

  const executerTransport = async (): Promise<{ reponse: Response; reponseCorps: unknown }> => {
    const reponse = await transport(url, {
      method: methode,
      headers: methode === 'GET' || methode === 'DELETE' ? EN_TETES_JSON : EN_TETES_ENVOI_JSON,
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: controleur.signal,
    });
    return { reponse, reponseCorps: await lireCorps(reponse) };
  };

  let expiration: ReturnType<typeof setTimeout> | undefined;
  const attenteExpiration = new Promise<never>((_resolve, reject) => {
    expiration = setTimeout(() => {
      expiree = true;
      controleur.abort();
      reject(new Error('expiration'));
    }, delaiExpirationMs);
  });

  let resultat: { reponse: Response; reponseCorps: unknown };
  try {
    resultat = await Promise.race([executerTransport(), attenteExpiration]);
  } catch {
    throw erreurTransport(expiree, signal?.aborted ?? false);
  } finally {
    clearTimeout(expiration);
    signal?.removeEventListener('abort', annuler);
  }

  const { reponse, reponseCorps } = resultat;
  if (!reponse.ok) throw traduireErreurHttp(reponse.status, reponseCorps);
  return { corps: reponseCorps, statut: reponse.status };
};

const get = async (chemin: string, options: OptionsRequete = {}): Promise<unknown> =>
  (
    await executer({
      url: construireUrlApi(chemin, options.parametres),
      methode: 'GET',
      signal: options.signal,
    })
  ).corps;

const getUrl = async (url: string, options: OptionsRequeteUrl): Promise<unknown> =>
  (await executer({ url, methode: 'GET', ...options })).corps;

const post = async (
  chemin: string,
  corps: unknown,
  options: OptionsEcriture = {},
): Promise<unknown> =>
  (
    await executer({
      url: construireUrlApi(chemin),
      methode: 'POST',
      corps,
      signal: options.signal,
    })
  ).corps;

const patch = async (
  chemin: string,
  corps: unknown,
  options: OptionsEcriture = {},
): Promise<unknown> =>
  (
    await executer({
      url: construireUrlApi(chemin),
      methode: 'PATCH',
      corps,
      signal: options.signal,
    })
  ).corps;

const supprimer = async (chemin: string, options: OptionsEcriture = {}): Promise<void> => {
  const resultat = await executer({
    url: construireUrlApi(chemin),
    methode: 'DELETE',
    signal: options.signal,
  });
  if (resultat.statut !== 204 || resultat.corps !== undefined) {
    throw creerErreurValidation(traduire('erreursHttp.reponseSuppression'));
  }
};

export const clientHttp = { get, getUrl, post, patch, supprimer };
