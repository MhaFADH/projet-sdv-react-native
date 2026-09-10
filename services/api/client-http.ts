import { creerErreurValidation, type ErreurApplication, traduireErreurHttp } from './erreurs';

const DELAI_EXPIRATION_MS = 10_000;
const EN_TETES_JSON = { Accept: 'application/json' } as const;

type ParametreRequete = string | number | boolean | undefined;

type OptionsLecture = {
  parametres?: Record<string, ParametreRequete>;
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

const get = async (chemin: string, options: OptionsLecture = {}): Promise<unknown> => {
  const url = construireUrl(chemin, options.parametres ?? {});
  const controleur = new AbortController();
  let expiree = false;
  const annuler = () => controleur.abort(options.signal?.reason);

  if (options.signal?.aborted) annuler();
  options.signal?.addEventListener('abort', annuler, { once: true });
  const expiration = setTimeout(() => {
    expiree = true;
    controleur.abort();
  }, DELAI_EXPIRATION_MS);

  let reponse: Response;
  let corps: unknown;
  try {
    reponse = await fetch(url, {
      method: 'GET',
      headers: EN_TETES_JSON,
      signal: controleur.signal,
    });
    corps = await lireCorps(reponse);
  } catch {
    throw erreurTransport(expiree, options.signal?.aborted ?? false);
  } finally {
    clearTimeout(expiration);
    options.signal?.removeEventListener('abort', annuler);
  }

  if (!reponse.ok) throw traduireErreurHttp(reponse.status, corps);
  return corps;
};

export const clientHttp = { get };
