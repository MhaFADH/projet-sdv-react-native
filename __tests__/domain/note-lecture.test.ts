import { describe, expect, it } from 'vitest';
import { formaterDateNote } from '../../domain/note-lecture';

describe('note de lecture', () => {
  it('formate la date et l’heure en français', () => {
    expect(formaterDateNote('2025-01-02T10:30:00')).toBe('2 janvier 2025 à 10:30');
  });
});
