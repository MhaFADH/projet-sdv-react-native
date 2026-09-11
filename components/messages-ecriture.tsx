import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { useLibelleReessai } from '@/hooks/use-libelle-reessai';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

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

export type AvisEcriture =
  | { type: 'refus'; message: string }
  | { type: 'indisponible'; message: string; secondesRestantes: number; reessayer: () => void }
  | {
      type: 'incertain';
      message: string;
      avertissement: string;
      libelleVerifier: string;
      libelleReessayer: string;
      verifier: () => void;
      reessayer: () => void;
    };

const Cadre = ({ children }: PropsWithChildren) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <View accessibilityRole="alert" style={styles.cadre}>
      {children}
    </View>
  );
};

const AvisRefus = ({ message }: { message: string }) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <Cadre>
      <Text style={styles.message}>{message}</Text>
    </Cadre>
  );
};

const AvisIndisponible = ({ message, secondesRestantes, reessayer }: AvisIndisponibleProps) => {
  const t = useTraduction();
  const libelleReessai = useLibelleReessai();
  const styles = useStylesTheme(creerStyles);

  return (
    <Cadre>
      <Text style={styles.message}>{t('ecriture.saisieConservee', { message })}</Text>
      <Bouton
        action={reessayer}
        desactive={secondesRestantes > 0}
        libelle={libelleReessai(secondesRestantes, t('ecriture.reessaiEnregistrement'))}
      />
    </Cadre>
  );
};

const AvisIncertain = ({
  message,
  avertissement,
  libelleVerifier,
  libelleReessayer,
  verifier,
  reessayer,
}: AvisIncertainProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <Cadre>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.message}>{avertissement}</Text>
      <View style={styles.actions}>
        <Bouton action={verifier} libelle={libelleVerifier} variante="secondaire" />
        <Bouton action={reessayer} indication={avertissement} libelle={libelleReessayer} />
      </View>
    </Cadre>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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

export const AvisEcritureView = ({ avis }: { avis: AvisEcriture }) => {
  if (avis.type === 'refus') return <AvisRefus message={avis.message} />;
  if (avis.type === 'indisponible') return <AvisIndisponible {...avis} />;
  return <AvisIncertain {...avis} />;
};
