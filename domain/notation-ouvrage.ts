import type { Ouvrage } from './ouvrage';

export type ValeurNotation = 0 | 1 | 2 | 3 | 4 | 5;

export type IntentionNotation = {
  id: string;
  valeur: ValeurNotation;
};

export const appliquerNotation = (ouvrage: Ouvrage, intention: IntentionNotation): Ouvrage =>
  ouvrage.id === intention.id ? { ...ouvrage, note: intention.valeur } : ouvrage;
