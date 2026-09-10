import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AvisEcriture } from '@/components/messages-ecriture';
import type { FormulaireNoteViewProps, ToastNote } from '@/components/notes/formulaire-note-view';
import { LONGUEUR_MAXIMALE_NOTE, type NoteLecture } from '@/domain/note-lecture';
import {
  longueurContenuNote,
  type NoteSaisie,
  SAISIE_NOTE_VIDE,
  type SaisieNote,
  saisieNoteRenseignee,
  saisieNoteSchema,
} from '@/domain/saisie-note';
import { useAjouterNote } from '@/hooks/use-ajouter-note';
import { useAvertissementDepart } from '@/hooks/use-avertissement-depart';
import { useTemporisation } from '@/hooks/use-temporisation';
import { useToastSucces } from '@/hooks/use-toast-succes';
import { interpreterEchecAjoutNote, type ResultatAjoutNote } from './resultat-note';
import { TEXTES_NOTE } from './textes-note';

export type CauseBlocageNote = 'ouvrage-introuvable' | 'ouvrage-masque';

const TEXTE_BLOCAGE: Record<CauseBlocageNote, string> = {
  'ouvrage-introuvable': TEXTES_NOTE.blocageOuvrageIntrouvable,
  'ouvrage-masque': TEXTES_NOTE.blocageOuvrageMasque,
};

type OptionsSaisieNote = {
  livreId: string;
  causeBlocage: CauseBlocageNote | null;
  rafraichirNotes: () => void;
};

export type SaisieNoteCoordonnee = {
  vue: FormulaireNoteViewProps;
  partir: (depart: () => void) => void;
};

export const useSaisieNote = ({
  livreId,
  causeBlocage,
  rafraichirNotes,
}: OptionsSaisieNote): SaisieNoteCoordonnee => {
  const ajout = useAjouterNote(livreId);
  const temporisation = useTemporisation();
  const succes = useToastSucces<NoteLecture>();
  const [resultat, setResultat] = useState<ResultatAjoutNote | null>(null);
  const [departEnAttente, setDepartEnAttente] = useState<(() => void) | null>(null);
  const envoiEnCours = useRef(false);

  const formulaire = useForm<SaisieNote, unknown, NoteSaisie>({
    resolver: zodResolver(saisieNoteSchema),
    defaultValues: SAISIE_NOTE_VIDE,
  });
  const contenu = formulaire.watch('contenu');
  const saisieRenseignee = saisieNoteRenseignee(contenu);
  useAvertissementDepart(saisieRenseignee);

  const envoyer = formulaire.handleSubmit(async (valeurs) => {
    if (envoiEnCours.current) return;
    envoiEnCours.current = true;
    temporisation.arreter();
    setResultat(null);

    try {
      const note = await ajout.mutateAsync(valeurs);
      formulaire.reset(SAISIE_NOTE_VIDE);
      succes.annoncer(note);
    } catch (cause) {
      const echec = interpreterEchecAjoutNote(cause);
      setResultat(echec);
      if (echec.type === 'refus' && echec.parChamp.contenu !== undefined) {
        formulaire.setError('contenu', { type: 'server', message: echec.parChamp.contenu });
      }
      if (echec.type === 'indisponible') temporisation.demarrer();
    } finally {
      envoiEnCours.current = false;
    }
  });

  const partir = (depart: () => void) => {
    if (!saisieRenseignee) {
      depart();
      return;
    }
    setDepartEnAttente(() => depart);
  };

  const construireAvis = (): AvisEcriture | null => {
    if (resultat === null) return null;
    if (resultat.type === 'indisponible') {
      return {
        type: 'indisponible',
        message: resultat.message,
        secondesRestantes: temporisation.secondesRestantes,
        reessayer: () => void envoyer(),
      };
    }
    if (resultat.type === 'incertain') {
      return {
        type: 'incertain',
        message: resultat.message,
        avertissement: TEXTES_NOTE.avertissementDoublon,
        libelleVerifier: TEXTES_NOTE.libelleVerifier,
        libelleReessayer: TEXTES_NOTE.libelleRenvoyer,
        verifier: rafraichirNotes,
        reessayer: () => void envoyer(),
      };
    }
    return resultat.message === undefined ? null : { type: 'refus', message: resultat.message };
  };

  const construireToast = (): ToastNote | null =>
    succes.toast === null
      ? null
      : {
          cle: succes.toast.cle,
          message: TEXTES_NOTE.messageSucces,
          suspendre: succes.suspendre,
          reprendre: succes.reprendre,
        };

  return {
    partir,
    vue: {
      libelleChamp: TEXTES_NOTE.libelleChamp,
      libelleEnvoyer: ajout.isPending
        ? TEXTES_NOTE.libelleEnvoiEnCours
        : TEXTES_NOTE.libelleAjouter,
      libelleEffacer: TEXTES_NOTE.libelleEffacer,
      controle: formulaire.control,
      caracteresUtilises: longueurContenuNote(contenu),
      caracteresMaximum: LONGUEUR_MAXIMALE_NOTE,
      enEnvoi: ajout.isPending,
      envoyer: () => void envoyer(),
      effacer: saisieRenseignee ? () => partir(() => formulaire.reset(SAISIE_NOTE_VIDE)) : null,
      blocage: causeBlocage === null ? null : TEXTE_BLOCAGE[causeBlocage],
      avis: construireAvis(),
      toast: construireToast(),
      confirmationAbandon:
        departEnAttente === null
          ? null
          : {
              confirmer: () => {
                setDepartEnAttente(null);
                departEnAttente();
              },
              poursuivre: () => setDepartEnAttente(null),
            },
    },
  };
};
