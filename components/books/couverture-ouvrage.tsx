import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { CouvertureResolue } from '@/services/couvertures';
import type { Theme } from '@/theme/tokens';

const LARGEUR_COUVERTURE = 80;
const HAUTEUR_COUVERTURE = 120;
const VISUEL_LOCAL = require('../../assets/images/couverture-indisponible.png') as number;

type CouvertureOuvrageProps = {
  couverture: CouvertureResolue;
  titre: string;
};

export const CouvertureOuvrage = ({ couverture, titre }: CouvertureOuvrageProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const [urlEchouee, setUrlEchouee] = useState<string>();
  const afficherVisuelLocal = couverture.type === 'locale' || couverture.url === urlEchouee;
  const source = afficherVisuelLocal ? VISUEL_LOCAL : couverture.url;
  const libelle = t(afficherVisuelLocal ? 'ouvrage.couvertureIndisponible' : 'ouvrage.couverture', {
    titre,
  });

  return (
    <Image
      accessibilityLabel={libelle}
      alt={libelle}
      cachePolicy="memory-disk"
      contentFit="cover"
      onError={couverture.type === 'distante' ? () => setUrlEchouee(couverture.url) : undefined}
      placeholder={VISUEL_LOCAL}
      placeholderContentFit="cover"
      source={source}
      style={styles.image}
    />
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    image: {
      width: LARGEUR_COUVERTURE,
      height: HAUTEUR_COUVERTURE,
      flexShrink: 0,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surfaceMuted,
    },
  });
