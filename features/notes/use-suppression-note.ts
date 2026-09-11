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
  resultats: Record<string, { cause: unknown }>,
  noteId: string,
): Record<string, { cause: unknown }> =>
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
  const [causesEchec, setCausesEchec] = useState<Record<string, { cause: unknown }>>({});
  const [noteDejaAbsente, setNoteDejaAbsente] = useState(false);
  const enVol = useRef(new Set<string>());

  const verifier = () => {
    setNoteDejaAbsente(false);
    rafraichirNotes();
  };

  const envoyer = async (noteId: string) => {
    if (enVol.current.has(noteId)) return;
    enVol.current.add(noteId);
    setEnvois((courants) => [...courants, noteId]);
    temporisations.arreter(noteId);
    setCausesEchec((courantes) => sansResultat(courantes, noteId));
    setNoteDejaAbsente(false);

    try {
      const issue = await mutation.mutateAsync(noteId);
      if (issue === 'deja-absente') setNoteDejaAbsente(true);
    } catch (cause) {
      const echec = interpreterEchecSuppressionNote(cause, textes);
      setCausesEchec((courantes) => ({ ...courantes, [noteId]: { cause } }));
      if (echec.type === 'indisponible') temporisations.demarrer(noteId);
    } finally {
      enVol.current.delete(noteId);
      setEnvois((courants) => courants.filter((id) => id !== noteId));
    }
  };

  const construireAvis = (noteId: string): AvisSuppressionNote | null => {
    const echec = causesEchec[noteId];
    if (echec === undefined) return null;
    const resultat: ResultatSuppressionNote = interpreterEchecSuppressionNote(echec.cause, textes);

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
    messageListe: noteDejaAbsente ? textes.messageDejaAbsente : null,
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
