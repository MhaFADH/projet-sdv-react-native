import { useRef, useState } from 'react';
import type { AvisSuppressionNote } from '@/components/notes/avis-suppression-note';
import type { DemandeSuppressionNote } from '@/components/notes/confirmation-suppression-note';
import type { CommandesSuppressionNote } from '@/components/notes/vue-liste-notes';
import type { NoteLecture } from '@/domain/note-lecture';
import { useSupprimerNote } from '@/hooks/use-supprimer-note';
import { useTemporisations } from '@/hooks/use-temporisations';
import { useTraduction } from '@/hooks/use-traduction';
import {
  interpreterEchecSuppressionNote,
  type ResultatSuppressionNote,
} from './resultat-suppression-note';
import { creerTextesSuppressionNote } from './textes-suppression-note';

type OptionsSuppressionNote = {
  livreId: string;
  rafraichirNotes: () => void;
};

export type SuppressionNoteCoordonnee = {
  suppression: CommandesSuppressionNote;
  messageListe: string | null;
  confirmation: DemandeSuppressionNote | null;
};

const sansResultat = (
  resultats: Record<string, ResultatSuppressionNote>,
  noteId: string,
): Record<string, ResultatSuppressionNote> =>
  Object.fromEntries(Object.entries(resultats).filter(([id]) => id !== noteId));

export const useSuppressionNote = ({
  livreId,
  rafraichirNotes,
}: OptionsSuppressionNote): SuppressionNoteCoordonnee => {
  const t = useTraduction();
  const textes = creerTextesSuppressionNote(t);
  const mutation = useSupprimerNote(livreId);
  const temporisations = useTemporisations();
  const [noteAConfirmer, setNoteAConfirmer] = useState<NoteLecture | null>(null);
  const [envois, setEnvois] = useState<readonly string[]>([]);
  const [resultats, setResultats] = useState<Record<string, ResultatSuppressionNote>>({});
  const [messageListe, setMessageListe] = useState<string | null>(null);
  const enVol = useRef(new Set<string>());

  const verifier = () => {
    setMessageListe(null);
    rafraichirNotes();
  };

  const envoyer = async (noteId: string) => {
    if (enVol.current.has(noteId)) return;
    enVol.current.add(noteId);
    setEnvois((courants) => [...courants, noteId]);
    temporisations.arreter(noteId);
    setResultats((courants) => sansResultat(courants, noteId));
    setMessageListe(null);

    try {
      const issue = await mutation.mutateAsync(noteId);
      if (issue === 'deja-absente') setMessageListe(textes.messageDejaAbsente);
    } catch (cause) {
      const echec = interpreterEchecSuppressionNote(cause, textes);
      setResultats((courants) => ({ ...courants, [noteId]: echec }));
      if (echec.type === 'indisponible') temporisations.demarrer(noteId);
    } finally {
      enVol.current.delete(noteId);
      setEnvois((courants) => courants.filter((id) => id !== noteId));
    }
  };

  const construireAvis = (noteId: string): AvisSuppressionNote | null => {
    const resultat = resultats[noteId];
    if (resultat === undefined) return null;

    return {
      message: resultat.message,
      libelleReessayer: textes.libelleReessayer,
      reessayer: () => void envoyer(noteId),
      secondesRestantes:
        resultat.type === 'indisponible' ? temporisations.secondesRestantes(noteId) : 0,
      verifier:
        resultat.type === 'incertain'
          ? { libelle: textes.libelleVerifier, executer: verifier }
          : undefined,
    };
  };

  const confirmer = (note: NoteLecture) => {
    setNoteAConfirmer(null);
    void envoyer(note.id);
  };

  return {
    messageListe,
    suppression: {
      libelle: textes.libelleSupprimer,
      libelleEnvoiEnCours: textes.libelleEnvoiEnCours,
      demander: (note) => setNoteAConfirmer(note),
      enEnvoi: (noteId) => envois.includes(noteId),
      avis: construireAvis,
    },
    confirmation:
      noteAConfirmer === null
        ? null
        : {
            note: noteAConfirmer,
            titre: textes.titreConfirmation,
            avertissement: textes.avertissementSansAnnulation,
            libelleRenoncer: textes.libelleRenoncer,
            libelleConfirmer: textes.libelleConfirmer,
            renoncer: () => setNoteAConfirmer(null),
            confirmer: () => confirmer(noteAConfirmer),
          },
  };
};
