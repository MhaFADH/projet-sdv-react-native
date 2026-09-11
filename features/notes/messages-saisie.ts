import type { MessagesSaisieNote } from '@/domain/saisie-note';
import type { Traduire } from '@/hooks/use-traduction';

export const creerMessagesSaisieNote = (t: Traduire): MessagesSaisieNote => ({
  obligatoire: t('validation.noteObligatoire'),
  longueurMaximale: (maximum) => t('validation.noteLongueurMaximale', { maximum }),
});
