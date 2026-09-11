import { creerErreurValidation } from './erreurs';

type ParametreUrl = string | number | boolean | undefined;

const lireUrlBaseApi = (): string => {
  const valeur = process.env.EXPO_PUBLIC_API_URL;
  if (!valeur) {
    throw creerErreurValidation("La variable EXPO_PUBLIC_API_URL n'est pas configurée.");
  }

  try {
    return new URL(valeur).toString().replace(/\/+$/, '');
  } catch {
    throw creerErreurValidation("La variable EXPO_PUBLIC_API_URL n'est pas une URL valide.");
  }
};

export const construireUrlApi = (
  chemin: string,
  parametres: Record<string, ParametreUrl> = {},
): string => {
  const url = new URL(`${lireUrlBaseApi()}${chemin}`);
  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur !== undefined) url.searchParams.set(cle, String(valeur));
  }
  return url.toString();
};
