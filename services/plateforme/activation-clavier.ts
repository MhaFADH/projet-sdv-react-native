import { Platform } from 'react-native';

type EvenementClavier = {
  key: string;
  repeat?: boolean;
  preventDefault: () => void;
};

const TOUCHES_ESPACE = new Set([' ', 'Spacebar']);

export const creerActivationParEspace = (activer: () => void) => {
  if (Platform.OS !== 'web') return {};
  return {
    onKeyDown: (evenement: EvenementClavier) => {
      if (!TOUCHES_ESPACE.has(evenement.key) || evenement.repeat) return;
      evenement.preventDefault();
      activer();
    },
  };
};
