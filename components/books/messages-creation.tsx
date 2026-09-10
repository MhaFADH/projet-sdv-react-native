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
  verifierLeFonds: () => void;
  reessayer: () => void;
};

const AVERTISSEMENT_DOUBLON =
  'Un nouvel envoi peut créer un second ouvrage identique : la création n’est pas rejouable sans risque de doublon.';

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

export const AvisIncertain = ({ message, verifierLeFonds, reessayer }: AvisIncertainProps) => (
  <Cadre>
    <Text style={styles.message}>{message}</Text>
    <Text style={styles.message}>{AVERTISSEMENT_DOUBLON}</Text>
    <View style={styles.actions}>
      <Bouton action={verifierLeFonds} libelle="Vérifier dans le fonds" variante="secondaire" />
      <Bouton
        action={reessayer}
        indication={AVERTISSEMENT_DOUBLON}
        libelle="Réessayer malgré le risque de doublon"
      />
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
