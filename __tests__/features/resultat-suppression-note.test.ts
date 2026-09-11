import { describe, expect, it } from 'vitest';
import { interpreterEchecSuppressionNote } from '../../features/notes/resultat-suppression-note';
import { creerTextesSuppressionNote } from '../../features/notes/textes-suppression-note';
import { traduireEnTest } from '../outils-traduction';

const TEXTES_SUPPRESSION_NOTE = creerTextesSuppressionNote(traduireEnTest);

describe('interprétation d’un échec de suppression de note', () => {
  it('propose une temporisation sur un 503', () => {
    expect(
      interpreterEchecSuppressionNote(
        {
          type: 'reseau',
          cause: 'indisponible',
          message: 'Service indisponible.',
          reessayable: true,
          statut: 503,
        },
        TEXTES_SUPPRESSION_NOTE,
      ),
    ).toEqual({ type: 'indisponible', message: 'Service indisponible.' });
  });

  it.each([
    ['une coupure', 'indisponible' as const, undefined],
    ['un délai d’expiration dépassé', 'expiration' as const, undefined],
    ['une erreur serveur', 'http' as const, 500],
  ])('présente %s comme un résultat incertain', (_libelle, cause, statut) => {
    expect(
      interpreterEchecSuppressionNote(
        {
          type: 'reseau',
          cause,
          message: 'Le serveur est injoignable.',
          reessayable: true,
          statut,
        },
        TEXTES_SUPPRESSION_NOTE,
      ),
    ).toEqual({ type: 'incertain', message: TEXTES_SUPPRESSION_NOTE.incertainSansReponse });
  });

  it('traite une réponse de succès non conforme comme un résultat incertain', () => {
    expect(
      interpreterEchecSuppressionNote(
        {
          type: 'validation',
          message: 'La réponse du serveur pour la suppression est invalide.',
        },
        TEXTES_SUPPRESSION_NOTE,
      ),
    ).toEqual({
      type: 'incertain',
      message: TEXTES_SUPPRESSION_NOTE.incertainReponseInexploitable,
    });
  });

  it('traite une cause hors du modèle applicatif comme un résultat incertain', () => {
    expect(interpreterEchecSuppressionNote(new Error('bruit'), TEXTES_SUPPRESSION_NOTE)).toEqual({
      type: 'incertain',
      message: TEXTES_SUPPRESSION_NOTE.incertainReponseInexploitable,
    });
  });

  it('présente un refus concluant avec le message du serveur', () => {
    expect(
      interpreterEchecSuppressionNote(
        {
          type: 'authentification',
          message: 'Droits insuffisants.',
          statut: 403,
        },
        TEXTES_SUPPRESSION_NOTE,
      ),
    ).toEqual({ type: 'echec', message: 'Droits insuffisants.' });
  });
});
