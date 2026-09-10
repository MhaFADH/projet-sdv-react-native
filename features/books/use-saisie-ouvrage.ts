import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type {
  AvisEcriture,
  FormulaireOuvrageViewProps,
  ToastEcriture,
} from '@/components/books/formulaire-ouvrage-view';
import type { Ouvrage } from '@/domain/ouvrage';
import {
  type ChampSaisieOuvrage,
  type OuvrageSaisi,
  type SaisieOuvrage,
  saisieOuvrageSchema,
} from '@/domain/saisie-ouvrage';
import { useAvertissementDepart } from '@/hooks/use-avertissement-depart';
import { useTemporisation } from '@/hooks/use-temporisation';
import { useToastSucces } from '@/hooks/use-toast-succes';
import { interpreterEchecEcriture, type ResultatEcriture } from './resultat-ecriture';
import type { TextesEcriture } from './textes-ecriture';

type OptionsSaisieOuvrage = {
  textes: TextesEcriture;
  valeursInitiales: SaisieOuvrage;
  enEnvoi: boolean;
  envoyer: (valeurs: OuvrageSaisi) => Promise<Ouvrage | null>;
  valeursApresSucces: (ouvrage: Ouvrage) => SaisieOuvrage;
  quitter: () => void;
  verifier: () => void;
  ouvrirOuvrage: (id: string) => void;
};

export const useSaisieOuvrage = ({
  textes,
  valeursInitiales,
  enEnvoi,
  envoyer,
  valeursApresSucces,
  quitter,
  verifier,
  ouvrirOuvrage,
}: OptionsSaisieOuvrage): FormulaireOuvrageViewProps => {
  const temporisation = useTemporisation();
  const succes = useToastSucces();
  const [resultat, setResultat] = useState<ResultatEcriture | null>(null);
  const [departEnAttente, setDepartEnAttente] = useState<(() => void) | null>(null);
  const [enregistrement, setEnregistrement] = useState<{
    cle: number;
    valeurs: SaisieOuvrage;
  } | null>(null);
  const enregistrements = useRef(0);
  const envoiEnCours = useRef(false);

  const formulaire = useForm<SaisieOuvrage, unknown, OuvrageSaisi>({
    resolver: zodResolver(saisieOuvrageSchema),
    defaultValues: valeursInitiales,
  });
  const { reset } = formulaire;
  useAvertissementDepart(formulaire.formState.isDirty);

  useEffect(() => {
    if (enregistrement === null) return;
    reset({ ...enregistrement.valeurs });
  }, [enregistrement, reset]);

  const appliquerRefus = (parChamp: Partial<Record<ChampSaisieOuvrage, string>>) => {
    for (const [champ, message] of Object.entries(parChamp)) {
      formulaire.setError(champ as ChampSaisieOuvrage, { type: 'server', message });
    }
  };

  const enregistrer = formulaire.handleSubmit(async (valeurs) => {
    if (envoiEnCours.current) return;
    envoiEnCours.current = true;
    temporisation.arreter();
    setResultat(null);

    try {
      const ouvrage = await envoyer(valeurs);
      if (ouvrage === null) {
        setResultat({ type: 'refus', parChamp: {}, message: textes.messageSansChangement });
        return;
      }
      enregistrements.current += 1;
      setEnregistrement({ cle: enregistrements.current, valeurs: valeursApresSucces(ouvrage) });
      succes.annoncer(ouvrage);
    } catch (cause) {
      const echec = interpreterEchecEcriture(cause, textes);
      setResultat(echec);
      if (echec.type === 'refus') appliquerRefus(echec.parChamp);
      if (echec.type === 'indisponible') temporisation.demarrer();
    } finally {
      envoiEnCours.current = false;
    }
  });

  const partir = (depart: () => void) => {
    if (!formulaire.formState.isDirty) {
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
        reessayer: enregistrer,
      };
    }
    if (resultat.type === 'incertain') {
      return {
        type: 'incertain',
        message: resultat.message,
        avertissement: textes.avertissementReessai,
        libelleVerifier: textes.libelleVerifier,
        libelleReessayer: textes.libelleReessayerIncertain,
        verifier: () => partir(verifier),
        reessayer: enregistrer,
      };
    }
    return resultat.message === undefined ? null : { type: 'refus', message: resultat.message };
  };

  const construireToast = (): ToastEcriture | null => {
    const annonce = succes.toast;
    if (annonce === null) return null;

    return {
      cle: annonce.cle,
      message: textes.messageSucces(annonce.titre),
      ouvrirFiche: () => partir(() => ouvrirOuvrage(annonce.ouvrageId)),
      suspendre: succes.suspendre,
      reprendre: succes.reprendre,
    };
  };

  return {
    avis: construireAvis(),
    confirmationAbandon:
      departEnAttente === null
        ? null
        : { confirmer: departEnAttente, poursuivre: () => setDepartEnAttente(null) },
    controle: formulaire.control,
    enEnvoi,
    enregistrer: () => void enregistrer(),
    libelleEnregistrer: enEnvoi ? textes.libelleEnvoiEnCours : textes.libelleEnregistrer,
    libelleQuitter: textes.libelleQuitter,
    quitter: () => partir(quitter),
    titre: textes.titre,
    toast: construireToast(),
  };
};
