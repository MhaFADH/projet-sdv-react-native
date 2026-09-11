import type { MessagesSaisieOuvrage } from '@/domain/saisie-ouvrage';
import type { Traduire } from '@/hooks/use-traduction';

export const creerMessagesSaisieOuvrage = (t: Traduire): MessagesSaisieOuvrage => ({
  libelleTitre: t('validation.libelleTitre'),
  libelleAuteur: t('validation.libelleAuteur'),
  libelleEditeur: t('validation.libelleEditeur'),
  obligatoire: (libelle) => t('validation.obligatoire', { libelle }),
  longueurMaximale: (libelle, maximum) => t('validation.longueurMaximale', { libelle, maximum }),
  anneeObligatoire: t('validation.anneeObligatoire'),
  anneeEntiere: t('validation.anneeEntiere'),
  anneeBornes: (minimum, maximum) => t('validation.anneeBornes', { minimum, maximum }),
});
