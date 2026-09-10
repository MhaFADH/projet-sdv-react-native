import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AvisCreation, ToastCreation } from '@/components/books/formulaire-ouvrage-view';
import { FormulaireOuvrageView } from '@/components/books/formulaire-ouvrage-view';
import {
  type ChampSaisieOuvrage,
  type OuvrageSaisi,
  SAISIE_OUVRAGE_VIDE,
  type SaisieOuvrage,
  saisieOuvrageSchema,
} from '@/domain/saisie-ouvrage';
import { useAvertissementDepart } from '@/hooks/use-avertissement-depart';
import { useCreerOuvrage } from '@/hooks/use-creer-ouvrage';
import { useTemporisation } from '@/hooks/use-temporisation';
import { useToastSucces } from '@/hooks/use-toast-succes';
import { interpreterEchecCreation, type ResultatCreation } from './resultat-creation';

type FormulaireOuvrageScreenProps = {
  retourAuFonds: () => void;
  ouvrirOuvrage: (id: string) => void;
};

export const FormulaireOuvrageScreen = ({
  retourAuFonds,
  ouvrirOuvrage,
}: FormulaireOuvrageScreenProps) => {
  const creation = useCreerOuvrage();
  const temporisation = useTemporisation();
  const succes = useToastSucces();
  const [resultat, setResultat] = useState<ResultatCreation | null>(null);
  const [departEnAttente, setDepartEnAttente] = useState<(() => void) | null>(null);
  const [creationsConfirmees, setCreationsConfirmees] = useState(0);
  const envoiEnCours = useRef(false);

  const formulaire = useForm<SaisieOuvrage, unknown, OuvrageSaisi>({
    resolver: zodResolver(saisieOuvrageSchema),
    defaultValues: SAISIE_OUVRAGE_VIDE,
  });
  const enEnvoi = creation.isPending;
  const { reset } = formulaire;
  useAvertissementDepart(formulaire.formState.isDirty);

  useEffect(() => {
    if (creationsConfirmees === 0) return;
    reset(SAISIE_OUVRAGE_VIDE);
  }, [creationsConfirmees, reset]);

  const appliquerRefus = (parChamp: Partial<Record<ChampSaisieOuvrage, string>>) => {
    for (const [champ, message] of Object.entries(parChamp)) {
      formulaire.setError(champ as ChampSaisieOuvrage, {
        type: 'server',
        message,
      });
    }
  };

  const enregistrer = formulaire.handleSubmit(async (valeurs) => {
    if (envoiEnCours.current) return;
    envoiEnCours.current = true;
    temporisation.arreter();
    setResultat(null);

    try {
      const ouvrage = await creation.mutateAsync(valeurs);
      setCreationsConfirmees((nombre) => nombre + 1);
      succes.annoncer(ouvrage);
    } catch (cause) {
      const echec = interpreterEchecCreation(cause);
      setResultat(echec);
      if (echec.type === 'refus') appliquerRefus(echec.parChamp);
      if (echec.type === 'indisponible') temporisation.demarrer();
    } finally {
      envoiEnCours.current = false;
    }
  });

  const construireAvis = (): AvisCreation | null => {
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
        verifierLeFonds: () => partir(retourAuFonds),
        reessayer: enregistrer,
      };
    }
    return resultat.message === undefined ? null : { type: 'refus', message: resultat.message };
  };

  const construireToast = (): ToastCreation | null => {
    const annonce = succes.toast;
    if (annonce === null) return null;

    return {
      cle: annonce.cle,
      titre: annonce.titre,
      ouvrirFiche: () => partir(() => ouvrirOuvrage(annonce.ouvrageId)),
      suspendre: succes.suspendre,
      reprendre: succes.reprendre,
    };
  };

  const partir = (depart: () => void) => {
    if (!formulaire.formState.isDirty) {
      depart();
      return;
    }
    setDepartEnAttente(() => depart);
  };

  return (
    <FormulaireOuvrageView
      avis={construireAvis()}
      confirmationAbandon={
        departEnAttente === null
          ? null
          : {
              confirmer: departEnAttente,
              poursuivre: () => setDepartEnAttente(null),
            }
      }
      controle={formulaire.control}
      enEnvoi={enEnvoi}
      enregistrer={() => void enregistrer()}
      quitter={() => partir(retourAuFonds)}
      toast={construireToast()}
    />
  );
};
