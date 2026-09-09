import { describe, expect, it } from 'vitest';

function calculerNombreDePages(total: number, limite: number): number {
  return Math.ceil(total / limite);
}

describe('configuration Vitest', () => {
  it('exécute un test TypeScript', () => {
    expect(calculerNombreDePages(500, 20)).toBe(25);
  });
});
