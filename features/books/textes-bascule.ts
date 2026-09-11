import type { AvisReessai } from '@/components/books/avis-echec-bascule';
import type { ChampBascule } from '@/domain/bascule-ouvrage';
import { traduire } from '@/services/i18n';

type ChampModification = ChampBascule | 'note';

const TEXTES = {
  lu: {
    sujet: 'bascule.sujetLu',
    reessai: 'bascule.reessaiLu',
    echec: 'bascule.echec',
    actualisation: 'bascule.echecActualisation',
  },
  favori: {
    sujet: 'bascule.sujetFavori',
    reessai: 'bascule.reessaiFavori',
    echec: 'bascule.echec',
    actualisation: 'bascule.echecActualisation',
  },
  note: {
    sujet: 'bascule.sujetNote',
    reessai: 'bascule.reessaiNote',
    echec: 'bascule.echecNotation',
    actualisation: 'bascule.echecActualisationNotation',
  },
} as const;

export const avisEchecBascule = (
  champ: ChampModification,
  message: string,
  reessayer: () => void,
): AvisReessai => ({
  message: traduire(TEXTES[champ].echec, {
    sujet: traduire(TEXTES[champ].sujet),
    message,
  }),
  libelleReessai: traduire(TEXTES[champ].reessai),
  reessayer,
});

export const avisEchecActualisation = (
  champ: ChampModification,
  message: string,
  reessayer: () => void,
): AvisReessai => ({
  message: traduire(TEXTES[champ].actualisation, {
    sujet: traduire(TEXTES[champ].sujet),
    message,
  }),
  libelleReessai: traduire('bascule.reessaiActualisation'),
  reessayer,
});
