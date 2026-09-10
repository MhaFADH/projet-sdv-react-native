import { Platform } from 'react-native';

type EvenementClavier = {
  key: string;
  repeat?: boolean;
  preventDefault: () => void;
};

type ActionsGroupeRadio = {
  activer: () => void;
  precedent: () => void;
  suivant: () => void;
  premier: () => void;
  dernier: () => void;
};

const TOUCHES_ESPACE = new Set([' ', 'Spacebar']);
const ACTIONS_RADIO: Record<string, keyof Omit<ActionsGroupeRadio, 'activer'>> = {
  ArrowLeft: 'precedent',
  ArrowUp: 'precedent',
  ArrowRight: 'suivant',
  ArrowDown: 'suivant',
  Home: 'premier',
  End: 'dernier',
};

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

export const creerNavigationGroupeRadio = (actions: ActionsGroupeRadio) => {
  if (Platform.OS !== 'web') return {};
  return {
    onKeyDown: (evenement: EvenementClavier) => {
      const action = ACTIONS_RADIO[evenement.key];
      if (action) {
        evenement.preventDefault();
        actions[action]();
        return;
      }
      if (!TOUCHES_ESPACE.has(evenement.key) || evenement.repeat) return;
      evenement.preventDefault();
      actions.activer();
    },
  };
};
