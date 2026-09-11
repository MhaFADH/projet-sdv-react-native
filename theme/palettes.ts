import type { ApparenceEffective } from '@/domain/preferences';

export type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  successBackground: string;
  successText: string;
  neutralBackground: string;
  dangerBackground: string;
  favoriBackground: string;
  favoriText: string;
  dangerText: string;
  focus: string;
  overlay: string;
};

const couleursClaires: Palette = {
  background: '#F7F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EAE4DA',
  text: '#1F2933',
  textMuted: '#52606D',
  border: '#C9C2B7',
  primary: '#5B3A29',
  primaryText: '#FFFFFF',
  successBackground: '#E1F2E8',
  successText: '#205C3B',
  neutralBackground: '#ECEFF2',
  dangerBackground: '#FBE9E7',
  favoriBackground: '#FCEAF1',
  favoriText: '#A32F5B',
  dangerText: '#8A2C24',
  focus: '#1D4ED8',
  overlay: 'rgba(31, 41, 51, 0.45)',
};

const couleursSombres: Palette = {
  background: '#16130F',
  surface: '#221D18',
  surfaceMuted: '#2E2822',
  text: '#F4F0EA',
  textMuted: '#C0B7AB',
  border: '#4A4139',
  primary: '#E0B48C',
  primaryText: '#221D18',
  successBackground: '#1D3A2B',
  successText: '#A7E3C2',
  neutralBackground: '#2A2F35',
  dangerBackground: '#3E211D',
  favoriBackground: '#3B1F2C',
  favoriText: '#F3A9C5',
  dangerText: '#F4B3AA',
  focus: '#9DC1FF',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const PALETTES: Record<ApparenceEffective, Palette> = {
  clair: couleursClaires,
  sombre: couleursSombres,
};
