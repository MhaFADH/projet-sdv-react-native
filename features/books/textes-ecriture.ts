export type TextesEcriture = {
  titre: string;
  libelleQuitter: string;
  libelleEnregistrer: string;
  messageSansChangement: string;
  libelleEnvoiEnCours: string;
  incertainSansReponse: string;
  incertainReponseInexploitable: string;
  avertissementReessai: string;
  libelleVerifier: string;
  libelleReessayerIncertain: string;
  messageSucces: (titre: string) => string;
};

export const TEXTES_CREATION: TextesEcriture = {
  titre: 'Ajouter un ouvrage',
  libelleQuitter: '← Retour au fonds',
  libelleEnregistrer: 'Enregistrer l’ouvrage',
  messageSansChangement: 'Aucune information à enregistrer.',
  libelleEnvoiEnCours: 'Enregistrement en cours…',
  incertainSansReponse:
    'Aucune réponse du serveur : l’ouvrage a peut-être été créé. Vérifiez le fonds avant de réessayer.',
  incertainReponseInexploitable:
    'La réponse du serveur est inexploitable : l’ouvrage a peut-être été créé. Vérifiez le fonds avant de réessayer.',
  avertissementReessai:
    'Un nouvel envoi peut créer un second ouvrage identique : la création n’est pas rejouable sans risque de doublon.',
  libelleVerifier: 'Vérifier dans le fonds',
  libelleReessayerIncertain: 'Réessayer malgré le risque de doublon',
  messageSucces: (titre) => `« ${titre} » a été ajouté au fonds.`,
};

export const TEXTES_CORRECTION: TextesEcriture = {
  titre: 'Corriger un ouvrage',
  libelleQuitter: '← Retour',
  libelleEnregistrer: 'Enregistrer la correction',
  messageSansChangement: 'Aucune modification à enregistrer : la fiche est déjà à jour.',
  libelleEnvoiEnCours: 'Enregistrement en cours…',
  incertainSansReponse:
    'Aucune réponse du serveur : la correction n’a peut-être pas été enregistrée. Vérifiez la fiche avant de réessayer.',
  incertainReponseInexploitable:
    'La réponse du serveur est inexploitable : la correction n’a peut-être pas été enregistrée. Vérifiez la fiche avant de réessayer.',
  avertissementReessai:
    'Un nouvel envoi renvoie la même correction sur le même ouvrage : il ne crée pas de second ouvrage.',
  libelleVerifier: 'Vérifier la fiche',
  libelleReessayerIncertain: 'Réessayer la correction',
  messageSucces: (titre) => `« ${titre} » a été corrigé.`,
};
