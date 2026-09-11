import { describe, expect, it } from 'vitest';
import { extraitNote, formaterDateNote } from '../../domain/note-lecture';

describe('note de lecture', () => {
  it('formate la date et l’heure selon la locale demandée', () => {
    expect(formaterDateNote('2025-01-02T10:30:00', 'fr-FR')).toBe('2 janvier 2025 à 10:30');
    expect(formaterDateNote('2025-01-02T10:30:00', 'en-US')).toBe('January 2, 2025 at 10:30 AM');
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
