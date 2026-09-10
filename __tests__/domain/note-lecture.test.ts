import { describe, expect, it } from 'vitest';
import { extraitNote, formaterDateNote, libelleNote } from '../../domain/note-lecture';

const note = {
  id: '03c36090-9281-40c4-8cf2-4e36c18304c6',
  livreId: '33575fa9-7968-45b3-8447-ec994a0b8401',
  contenu: 'Observation ancienne.',
  createdAt: '2025-01-02T10:30:00',
};

describe('note de lecture', () => {
  it('formate la date et l’heure en français', () => {
    expect(formaterDateNote('2025-01-02T10:30:00')).toBe('2 janvier 2025 à 10:30');
  });

  it('identifie une note par sa date et son contenu, la minute ne suffisant pas', () => {
    expect(libelleNote(note)).toBe('note du 2 janvier 2025 à 10:30 : « Observation ancienne. »');
  });

  it('distingue deux notes de la même minute', () => {
    const autre = { ...note, id: 'autre', contenu: 'Observation récente.' };

    expect(libelleNote(note)).not.toBe(libelleNote(autre));
  });
});

describe('extrait du contenu d’une note', () => {
  it('conserve un contenu court tel quel', () => {
    expect(extraitNote('Observation ancienne.')).toBe('Observation ancienne.');
  });

  it('conserve un contenu de la longueur exacte du seuil', () => {
    const contenu = 'x'.repeat(80);

    expect(extraitNote(contenu)).toBe(contenu);
  });

  it('tronque un contenu long et signale la coupe', () => {
    const extrait = extraitNote(`${'x'.repeat(80)} et la suite ignorée`);

    expect(extrait).toBe(`${'x'.repeat(80)}…`);
  });

  it('ne laisse pas d’espace avant les points de suspension', () => {
    expect(extraitNote(`${'x'.repeat(79)} mot suivant`)).toBe(`${'x'.repeat(79)}…`);
  });
});
