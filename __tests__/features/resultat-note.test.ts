import { describe, expect, it } from 'vitest';
import { interpreterEchecAjoutNote } from '../../features/notes/resultat-note';
import { creerTextesNote } from '../../features/notes/textes-note';
import { traduireEnTest } from '../outils-traduction';

const TEXTES_NOTE = creerTextesNote(traduireEnTest);

describe('interprétation d’un échec d’ajout de note', () => {
  it('dirige un refus 422 vers le champ contenu', () => {
    expect(
      interpreterEchecAjoutNote(
        {
          type: 'validation',
          message: 'Certaines données sont invalides.',
          champs: { contenu: 'contenu obligatoire, 1000 caracteres maximum' },
        },
        TEXTES_NOTE,
      ),
    ).toEqual({
      type: 'refus',
      parChamp: { contenu: 'contenu obligatoire, 1000 caracteres maximum' },
      message: undefined,
    });
  });

  it('remonte un refus 422 sans champ connu comme message général', () => {
    expect(
      interpreterEchecAjoutNote(
        {
          type: 'validation',
          message: 'Certaines données sont invalides.',
          champs: { livreId: 'inconnu' },
        },
        TEXTES_NOTE,
      ),
    ).toEqual({
      type: 'refus',
      parChamp: {},
      message: 'livreId : inconnu',
    });
  });

  it('traite une réponse illisible comme un résultat incertain', () => {
    expect(
      interpreterEchecAjoutNote({ type: 'validation', message: 'Réponse invalide.' }, TEXTES_NOTE),
    ).toEqual({
      type: 'incertain',
      message: TEXTES_NOTE.incertainReponseInexploitable,
    });
  });

  it('traite une cause hors du modèle applicatif comme un résultat incertain', () => {
    expect(interpreterEchecAjoutNote(new Error('bruit'), TEXTES_NOTE)).toEqual({
      type: 'incertain',
      message: TEXTES_NOTE.incertainReponseInexploitable,
    });
  });

  it('traite une absence de l’ouvrage comme un refus explicite', () => {
    expect(
      interpreterEchecAjoutNote({ type: 'introuvable', message: 'Livre inconnu.' }, TEXTES_NOTE),
    ).toEqual({
      type: 'refus',
      parChamp: {},
      message: TEXTES_NOTE.refusIntrouvable,
    });
  });

  it('propose une temporisation sur un 503', () => {
    expect(
      interpreterEchecAjoutNote(
        {
          type: 'reseau',
          cause: 'indisponible',
          message: 'Service indisponible.',
          reessayable: true,
          statut: 503,
        },
        TEXTES_NOTE,
      ),
    ).toEqual({ type: 'indisponible', message: 'Service indisponible.' });
  });

  it.each([
    ['une coupure', 'indisponible' as const, undefined],
    ['un délai d’expiration dépassé', 'expiration' as const, undefined],
    ['une erreur serveur', 'http' as const, 500],
  ])('présente %s comme un résultat incertain', (_libelle, cause, statut) => {
    expect(
      interpreterEchecAjoutNote(
        {
          type: 'reseau',
          cause,
          message: 'Le serveur est injoignable.',
          reessayable: true,
          statut,
        },
        TEXTES_NOTE,
      ),
    ).toEqual({ type: 'incertain', message: TEXTES_NOTE.incertainSansReponse });
  });

  it('présente un refus HTTP concluant comme un refus', () => {
    expect(
      interpreterEchecAjoutNote(
        {
          type: 'reseau',
          cause: 'http',
          message: 'La requête a échoué.',
          reessayable: false,
          statut: 400,
        },
        TEXTES_NOTE,
      ),
    ).toEqual({ type: 'refus', parChamp: {}, message: 'La requête a échoué.' });
  });
});
