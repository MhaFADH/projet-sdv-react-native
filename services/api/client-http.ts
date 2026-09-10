import { creerErreurValidation, type ErreurApplication, traduireErreurHttp } from './erreurs';

const DELAI_EXPIRATION_MS = 10_000;
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
  methode: 'GET' | 'POST' | 'PATCH';
  parametres?: Record<string, ParametreRequete>;
  corps?: unknown;
  signal?: AbortSignal;
};

const construireUrl = (chemin: string, parametres: Record<string, ParametreRequete>): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw creerErreurValidation("La variable EXPO_PUBLIC_API_URL n'est pas configurée.");
  }

  try {
    const url = new URL(`${baseUrl.replace(/\/+$/, '')}${chemin}`);
    for (const [cle, valeur] of Object.entries(parametres)) {
      if (valeur !== undefined) url.searchParams.set(cle, String(valeur));
    }
    return url.toString();
  } catch {
    throw creerErreurValidation("La variable EXPO_PUBLIC_API_URL n'est pas une URL valide.");
  }
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
      message: "Le délai d'attente de la requête est dépassé.",
      reessayable: true,
    };
  }

  if (annulee) {
    return {
      type: 'reseau',
      cause: 'annulation',
      message: 'La requête a été annulée.',
      reessayable: false,
    };
  }

  return {
    type: 'reseau',
    cause: 'indisponible',
    message: 'Le serveur est injoignable.',
    reessayable: true,
  };
};

const executer = async ({
  chemin,
  methode,
  parametres = {},
  corps,
  signal,
}: RequeteHttp): Promise<unknown> => {
  const url = construireUrl(chemin, parametres);
  const controleur = new AbortController();
  let expiree = false;
  const annuler = () => controleur.abort(signal?.reason);

  if (signal?.aborted) annuler();
  signal?.addEventListener('abort', annuler, { once: true });
  const expiration = setTimeout(() => {
    expiree = true;
    controleur.abort();
  }, DELAI_EXPIRATION_MS);

  let reponse: Response;
  let reponseCorps: unknown;
  try {
    reponse = await fetch(url, {
      method: methode,
      headers: methode === 'GET' ? EN_TETES_JSON : EN_TETES_ENVOI_JSON,
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
  return reponseCorps;
};

const get = (chemin: string, options: OptionsRequete = {}): Promise<unknown> =>
  executer({ chemin, methode: 'GET', parametres: options.parametres, signal: options.signal });

const post = (chemin: string, corps: unknown, options: OptionsEcriture = {}): Promise<unknown> =>
  executer({ chemin, methode: 'POST', corps, signal: options.signal });

const patch = (chemin: string, corps: unknown, options: OptionsEcriture = {}): Promise<unknown> =>
  executer({ chemin, methode: 'PATCH', corps, signal: options.signal });

export const clientHttp = { get, post, patch };
