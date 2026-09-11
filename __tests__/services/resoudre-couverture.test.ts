import { afterEach, describe, expect, it, vi } from 'vitest';
import { resoudreCouverture } from '../../services/couvertures';

const IDENTIFIANT = '33575fa9-7968-45b3-8447-ec994a0b8401';

afterEach(() => vi.unstubAllEnvs());

describe('résolution d’une couverture', () => {
  it('préfixe un chemin relatif avec l’URL de l’API', () => {
    expect(resoudreCouverture('/covers/bel-ami.jpg', IDENTIFIANT)).toEqual({
      type: 'distante',
      url: 'http://localhost:3000/covers/bel-ami.jpg',
    });
  });

  it('conserve une URL HTTP absolue', () => {
    const url = 'https://images.example.com/bel-ami.jpg';

    expect(resoudreCouverture(url, IDENTIFIANT)).toEqual({ type: 'distante', url });
  });

  it('produit pour une valeur absente un repli stable dérivé de l’identifiant', () => {
    const premiereResolution = resoudreCouverture(null, IDENTIFIANT);
    const secondeResolution = resoudreCouverture(null, IDENTIFIANT);

    expect(premiereResolution).toEqual({
      type: 'distante',
      url: `https://picsum.photos/seed/${IDENTIFIANT}/160/240`,
    });
    expect(secondeResolution).toEqual(premiereResolution);
  });

  it.each(['', '   ', 'javascript:alert(1)', 'ftp://example.com/couverture.jpg'])(
    'oriente la valeur invalide %j vers le visuel local',
    (valeur) => {
      expect(resoudreCouverture(valeur, IDENTIFIANT)).toEqual({ type: 'locale' });
    },
  );

  it('ne masque pas une configuration absente pour un chemin relatif', () => {
    vi.stubEnv('EXPO_PUBLIC_API_URL', '');

    expect(() => resoudreCouverture('/covers/bel-ami.jpg', IDENTIFIANT)).toThrow(
      "La variable EXPO_PUBLIC_API_URL n'est pas configurée.",
    );
  });
});
