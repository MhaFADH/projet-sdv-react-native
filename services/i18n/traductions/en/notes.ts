export const notesEn = {
  notes: {
    ajouterTitre: 'Add a reading note',
    section: 'Reading notes',
    liste: 'Reading notes for {{titre}}',
    chargement: 'Loading the notes for {{titre}}',
    vide: 'No reading note for {{titre}} yet.',
    reessaiChargement: 'Retry loading the notes',
    reessaiEnCours: 'Retrying',
    date: 'Note from {{date}}',
    libelle: 'note from {{date}}: “{{extrait}}”',
    supprimerCible: 'Delete the {{note}}',
    compteur: '{{utilises}} / {{maximum}} characters',
    compteurUtilises: '{{compteur}} used',
    champ: 'Reading note',
    ajouter: 'Add the note',
    envoiEnCours: 'Sending the note…',
    effacer: 'Clear the entry',
    succes: 'The note was added to this record.',
    refusIntrouvable:
      'This book does not exist any more: the note was not saved. Your text stays on screen so you can copy it.',
    incertainSansReponse:
      'No response from the server: the note may have been saved. Refresh the notes to check before sending again.',
    incertainReponseInexploitable:
      'The server response is unusable: the note may have been saved. Refresh the notes to check before sending again.',
    avertissementDoublon:
      'Sending again may create a second note: an identical note does not prove the first attempt succeeded, and its absence does not prove it was refused.',
    verifier: 'Refresh the notes',
    renvoyer: 'Send again despite the duplicate risk',
    blocageOuvrageIntrouvable:
      'This book does not exist any more: no note can be added to it. Your text stays on screen so you can copy it.',
    blocageOuvrageMasque:
      'This book is hidden until its deletion completes: adding a note is suspended. Your text is preserved.',
  },
  suppressionNote: {
    dialogue: 'Note deletion confirmation',
    titreConfirmation: 'Confirm the note deletion',
    avertissementSansAnnulation:
      'This note is sent immediately after confirmation, with no delay and no undo. No restoration is possible afterwards.',
    renoncer: 'Cancel the deletion',
    confirmer: 'Delete the note',
    supprimer: 'Delete',
    envoiEnCours: 'Deleting',
    dejaAbsente: 'This note is no longer on the server: it may already have been deleted.',
    incertainSansReponse:
      'No response from the server: the note may have been deleted. Refresh the notes to check before retrying.',
    incertainReponseInexploitable:
      'The server response is unusable: the note may have been deleted. Refresh the notes to check before retrying.',
    verifier: 'Refresh the notes',
    reessayer: 'Retry the deletion',
  },
};
