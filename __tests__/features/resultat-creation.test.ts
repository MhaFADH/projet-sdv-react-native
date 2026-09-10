import { describe, expect, it } from 'vitest';
import { interpreterEchecCreation } from '../../features/books/resultat-creation';

describe('interprétation de l’échec d’une création', () => {
  it('reporte un refus 422 sur les champs du formulaire', () => {
    expect(
      interpreterEchecCreation({
        type: 'validation',
        message: 'Certaines données sont invalides.',
        champs: { titre: 'ne peut pas etre vide' },
      }),
    ).toEqual({ type: 'refus', parChamp: { titre: 'ne peut pas etre vide' }, message: undefined });
  });

  it('rend visible un refus portant sur un champ absent du formulaire', () => {
    expect(
      interpreterEchecCreation({
        type: 'validation',
        message: 'Certaines données sont invalides.',
        champs: { lu: 'doit etre un booleen' },
      }),
    ).toEqual({ type: 'refus', parChamp: {}, message: 'lu : doit etre un booleen' });
  });

  it('propose un réessai uniquement pour une indisponibilité annoncée par le serveur', () => {
    expect(
      interpreterEchecCreation({
        type: 'reseau',
        cause: 'indisponible',
        message: 'Le service est temporairement indisponible.',
        reessayable: true,
        statut: 503,
      }),
    ).toEqual({ type: 'indisponible', message: 'Le service est temporairement indisponible.' });
  });

  it('traite une panne serveur comme un sort inconnu, jamais comme une absence de création', () => {
    const resultat = interpreterEchecCreation({
      type: 'reseau',
      cause: 'http',
      message: 'La requête a échoué.',
      reessayable: true,
      statut: 500,
    });

    expect(resultat.type).toBe('incertain');
    expect(resultat).toHaveProperty('message', expect.stringContaining('peut-être été créé'));
  });

  it('traite une absence de réponse et une réponse inexploitable comme un sort inconnu', () => {
    const coupure = interpreterEchecCreation({
      type: 'reseau',
      cause: 'indisponible',
      message: 'Le serveur est injoignable.',
      reessayable: true,
    });
    const reponseInvalide = interpreterEchecCreation({
      type: 'validation',
      message: 'La réponse du serveur pour l’ouvrage créé est invalide.',
    });

    expect(coupure.type).toBe('incertain');
    expect(reponseInvalide.type).toBe('incertain');
  });

  it('ne présente jamais une exception inattendue comme une absence de création', () => {
    expect(interpreterEchecCreation(new TypeError('boom')).type).toBe('incertain');
  });

  it('présente un refus HTTP explicite du serveur sans proposer de réessai', () => {
    expect(
      interpreterEchecCreation({
        type: 'reseau',
        cause: 'http',
        message: 'La requête a échoué.',
        reessayable: false,
        statut: 405,
      }),
    ).toEqual({ type: 'refus', parChamp: {}, message: 'La requête a échoué.' });
  });
});
