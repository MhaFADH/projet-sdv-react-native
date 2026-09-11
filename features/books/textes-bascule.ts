import type { AvisReessai } from '@/components/books/avis-echec-bascule';
import type { ChampBascule } from '@/domain/bascule-ouvrage';
import type { Traduire } from '@/hooks/use-traduction';

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
  t: Traduire,
): AvisReessai => ({
  message: t(TEXTES[champ].echec, {
    sujet: t(TEXTES[champ].sujet),
    message,
  }),
  libelleReessai: t(TEXTES[champ].reessai),
  reessayer,
});

export const avisEchecActualisation = (
  champ: ChampModification,
  message: string,
  reessayer: () => void,
  t: Traduire,
): AvisReessai => ({
  message: t(TEXTES[champ].actualisation, {
    sujet: t(TEXTES[champ].sujet),
    message,
  }),
  libelleReessai: t('bascule.reessaiActualisation'),
  reessayer,
});
