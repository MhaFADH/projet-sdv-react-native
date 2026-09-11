import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Ouvrage } from '@/domain/ouvrage';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { CouvertureResolue } from '@/services/couvertures';
import type { Theme } from '@/theme/tokens';
import { CouvertureOuvrage } from './couverture-ouvrage';
import { StatutLecture } from './statut-lecture';

type CarteLigneOuvrageProps = {
  ouvrage: Ouvrage;
  couverture: CouvertureResolue;
  editeur: string;
  notation: string;
  statut: string;
  compacte: boolean;
  ouvertureDesactivee: boolean;
  ouvrirOuvrage: () => void;
};

export const CarteLigneOuvrage = ({
  ouvrage,
  couverture,
  editeur,
  notation,
  statut,
  compacte,
  ouvertureDesactivee,
  ouvrirOuvrage,
}: CarteLigneOuvrageProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <Pressable
      accessibilityHint={t(
        ouvertureDesactivee ? 'ouvrage.ouvertureIndisponible' : 'ouvrage.ouvrir',
      )}
      accessibilityLabel={t('ouvrage.resume', {
        titre: ouvrage.titre,
        auteur: ouvrage.auteur,
        statut,
      })}
      accessibilityRole="button"
      accessibilityState={{ disabled: ouvertureDesactivee }}
      disabled={ouvertureDesactivee}
      onPress={ouvrirOuvrage}
      style={[
        styles.carte,
        compacte && styles.carteCompacte,
        ouvertureDesactivee && styles.carteDesactivee,
      ]}
    >
      <CouvertureOuvrage couverture={couverture} titre={ouvrage.titre} />
      <View style={styles.description}>
        <Text style={styles.titre}>{ouvrage.titre}</Text>
        <Text style={styles.auteur}>{ouvrage.auteur}</Text>
        <Text style={styles.edition}>
          {t('ouvrage.edition', { editeur, annee: ouvrage.annee })}
        </Text>
        <Text style={styles.notation}>{notation}</Text>
      </View>
      <StatutLecture lu={ouvrage.lu} />
    </Pressable>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    carte: {
      minHeight: theme.layout.cardMinHeight,
      minWidth: 0,
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
    },
    carteDesactivee: {
      opacity: 0.5,
    },
    carteCompacte: {
      width: '100%',
    },
    description: {
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.itemTitle,
      fontWeight: '700',
    },
    auteur: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
    edition: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.metadata,
    },
    notation: {
      color: theme.colors.text,
      fontSize: theme.typography.metadata,
      fontWeight: '600',
    },
  });
