import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { theme } from '@/theme/tokens';

type AvisIndisponibleProps = {
  message: string;
  secondesRestantes: number;
  reessayer: () => void;
};

type AvisIncertainProps = {
  message: string;
  avertissement: string;
  libelleVerifier: string;
  libelleReessayer: string;
  verifier: () => void;
  reessayer: () => void;
};

const Cadre = ({ children }: PropsWithChildren) => (
  <View accessibilityRole="alert" style={styles.cadre}>
    {children}
  </View>
);

export const AvisRefus = ({ message }: { message: string }) => (
  <Cadre>
    <Text style={styles.message}>{message}</Text>
  </Cadre>
);

export const AvisIndisponible = ({
  message,
  secondesRestantes,
  reessayer,
}: AvisIndisponibleProps) => (
  <Cadre>
    <Text style={styles.message}>{message} Votre saisie est conservée.</Text>
    <Bouton
      action={reessayer}
      desactive={secondesRestantes > 0}
      libelle={
        secondesRestantes > 0
          ? `Réessayer dans ${secondesRestantes} s`
          : 'Réessayer l’enregistrement'
      }
    />
  </Cadre>
);

export const AvisIncertain = ({
  message,
  avertissement,
  libelleVerifier,
  libelleReessayer,
  verifier,
  reessayer,
}: AvisIncertainProps) => (
  <Cadre>
    <Text style={styles.message}>{message}</Text>
    <Text style={styles.message}>{avertissement}</Text>
    <View style={styles.actions}>
      <Bouton action={verifier} libelle={libelleVerifier} variante="secondaire" />
      <Bouton action={reessayer} indication={avertissement} libelle={libelleReessayer} />
    </View>
  </Cadre>
);

const styles = StyleSheet.create({
  cadre: {
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerBackground,
    padding: theme.spacing.md,
  },
  message: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
