import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AvisEcriture } from '@/components/messages-ecriture';
import type { FormulaireNoteViewProps, ToastNote } from '@/components/notes/formulaire-note-view';
import { LONGUEUR_MAXIMALE_NOTE, type NoteLecture } from '@/domain/note-lecture';
import {
  creerSaisieNoteSchema,
  longueurContenuNote,
  type NoteSaisie,
  SAISIE_NOTE_VIDE,
  type SaisieNote,
  saisieNoteRenseignee,
} from '@/domain/saisie-note';
import { useAjouterNote } from '@/hooks/use-ajouter-note';
import { useAvertissementDepart } from '@/hooks/use-avertissement-depart';
import { useTemporisation } from '@/hooks/use-temporisation';
import { useToastSucces } from '@/hooks/use-toast-succes';
import { useTraduction } from '@/hooks/use-traduction';
import { creerMessagesSaisieNote } from './messages-saisie';
import { interpreterEchecAjoutNote, type ResultatAjoutNote } from './resultat-note';
import { creerTextesNote } from './textes-note';

export type CauseBlocageNote = 'ouvrage-introuvable' | 'ouvrage-masque';

const CLES_BLOCAGE: Record<CauseBlocageNote, 'blocageOuvrageIntrouvable' | 'blocageOuvrageMasque'> =
  {
    'ouvrage-introuvable': 'blocageOuvrageIntrouvable',
    'ouvrage-masque': 'blocageOuvrageMasque',
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
  const t = useTraduction();
  const textes = creerTextesNote(t);
  const ajout = useAjouterNote(livreId);
  const temporisation = useTemporisation();
  const succes = useToastSucces<NoteLecture>();
  const [resultat, setResultat] = useState<ResultatAjoutNote | null>(null);
  const [departEnAttente, setDepartEnAttente] = useState<(() => void) | null>(null);
  const envoiEnCours = useRef(false);

  const formulaire = useForm<SaisieNote, unknown, NoteSaisie>({
    resolver: zodResolver(creerSaisieNoteSchema(creerMessagesSaisieNote(t))),
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
      const echec = interpreterEchecAjoutNote(cause, textes);
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
        avertissement: textes.avertissementDoublon,
        libelleVerifier: textes.libelleVerifier,
        libelleReessayer: textes.libelleRenvoyer,
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
          message: textes.messageSucces,
          suspendre: succes.suspendre,
          reprendre: succes.reprendre,
        };

  return {
    partir,
    vue: {
      libelleChamp: textes.libelleChamp,
      libelleEnvoyer: ajout.isPending ? textes.libelleEnvoiEnCours : textes.libelleAjouter,
      libelleEffacer: textes.libelleEffacer,
      controle: formulaire.control,
      caracteresUtilises: longueurContenuNote(contenu),
      caracteresMaximum: LONGUEUR_MAXIMALE_NOTE,
      enEnvoi: ajout.isPending,
      envoyer: () => void envoyer(),
      effacer: saisieRenseignee ? () => partir(() => formulaire.reset(SAISIE_NOTE_VIDE)) : null,
      blocage: causeBlocage === null ? null : textes[CLES_BLOCAGE[causeBlocage]],
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
