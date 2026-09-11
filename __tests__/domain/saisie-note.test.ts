import { describe, expect, it } from 'vitest';
import { LONGUEUR_MAXIMALE_NOTE } from '../../domain/note-lecture';
import {
  creerSaisieNoteSchema,
  longueurContenuNote,
  repartirRefusNote,
  SAISIE_NOTE_VIDE,
  saisieNoteRenseignee,
} from '../../domain/saisie-note';
import { creerMessagesSaisieNote } from '../../features/notes/messages-saisie';
import { traduireEnTest } from '../outils-traduction';

const saisieNoteSchema = creerSaisieNoteSchema(creerMessagesSaisieNote(traduireEnTest));

describe('schéma de saisie d’une note de lecture', () => {
  it('normalise les espaces périphériques du contenu', () => {
    const resultat = saisieNoteSchema.safeParse({ contenu: '  Une belle découverte.  ' });

    expect(resultat.success).toBe(true);
    expect(resultat.success && resultat.data.contenu).toBe('Une belle découverte.');
  });

  it.each([
    ['un contenu vide', ''],
    ['un contenu fait d’espaces', '   \n\t '],
  ])('refuse %s comme contenu obligatoire', (_libelle, contenu) => {
    const resultat = saisieNoteSchema.safeParse({ contenu });

    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.message).toBe('Le contenu de la note est obligatoire.');
  });

  it('accepte exactement la longueur maximale du contrat', () => {
    const resultat = saisieNoteSchema.safeParse({ contenu: 'x'.repeat(LONGUEUR_MAXIMALE_NOTE) });

    expect(resultat.success).toBe(true);
  });

  it('refuse un contenu qui dépasse la longueur maximale', () => {
    const resultat = saisieNoteSchema.safeParse({
      contenu: 'x'.repeat(LONGUEUR_MAXIMALE_NOTE + 1),
    });

    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.message).toBe(
      'La note ne peut pas dépasser 1000 caractères.',
    );
  });

  it('accepte un contenu dont seuls les espaces périphériques dépassent la limite', () => {
    const resultat = saisieNoteSchema.safeParse({
      contenu: ` ${'x'.repeat(LONGUEUR_MAXIMALE_NOTE)} `,
    });

    expect(resultat.success).toBe(true);
  });

  it('démarre sur une saisie vide', () => {
    expect(SAISIE_NOTE_VIDE).toEqual({ contenu: '' });
  });
});

describe('mesure du contenu d’une note', () => {
  it('compte la longueur réellement envoyée au serveur', () => {
    expect(longueurContenuNote('  bonjour  ')).toBe(7);
    expect(longueurContenuNote('   ')).toBe(0);
  });

  it('distingue une saisie renseignée d’une saisie vide', () => {
    expect(saisieNoteRenseignee('  ')).toBe(false);
    expect(saisieNoteRenseignee(' a ')).toBe(true);
  });
});

describe('répartition d’un refus serveur de note', () => {
  it('dirige le champ contenu vers le formulaire', () => {
    expect(repartirRefusNote({ contenu: 'contenu obligatoire, 1000 caracteres maximum' })).toEqual({
      parChamp: { contenu: 'contenu obligatoire, 1000 caracteres maximum' },
      horsFormulaire: [],
    });
  });

  it('conserve les autres champs comme messages généraux', () => {
    expect(repartirRefusNote({ livreId: 'inconnu' })).toEqual({
      parChamp: {},
      horsFormulaire: ['livreId : inconnu'],
    });
  });

  it('accepte l’absence de champs', () => {
    expect(repartirRefusNote(undefined)).toEqual({ parChamp: {}, horsFormulaire: [] });
  });
});
