export const LONGUEUR_MAXIMALE_NOTE = 1_000;

export type NoteLecture = {
  id: string;
  livreId: string;
  contenu: string;
  createdAt: string;
};

const formatteurDateNote = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formaterDateNote = (createdAt: string): string =>
  formatteurDateNote.format(new Date(createdAt));
