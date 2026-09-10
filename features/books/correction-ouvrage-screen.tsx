import { useState } from 'react';
import { CorrectionIndisponibleView } from '@/components/books/correction-indisponible-view';
import { FormulaireOuvrageView } from '@/components/books/formulaire-ouvrage-view';
import { identifiantUtilisable, type Ouvrage } from '@/domain/ouvrage';
import {
  correctionOuvrage,
  type OuvrageSaisi,
  referenceDepuisOuvrage,
  saisieDepuisOuvrage,
} from '@/domain/saisie-ouvrage';
import { useBook } from '@/hooks/use-book';
import { useModifierOuvrage } from '@/hooks/use-modifier-ouvrage';
import { TEXTES_CORRECTION } from './textes-ecriture';
import { useSaisieOuvrage } from './use-saisie-ouvrage';

const ABSENCE_PAR_DEFAUT = "Cet ouvrage n'existe pas ou plus.";

type CorrectionOuvrageScreenProps = {
  id: string;
  retourAuFonds: () => void;
  ouvrirOuvrage: (id: string) => void;
};

const FormulaireCorrection = ({
  ouvrage,
  retourAuFonds,
  ouvrirOuvrage,
}: { ouvrage: Ouvrage } & Omit<CorrectionOuvrageScreenProps, 'id'>) => {
  const modification = useModifierOuvrage();
  const [reference, setReference] = useState<OuvrageSaisi>(() => referenceDepuisOuvrage(ouvrage));

  const envoyer = async (valeurs: OuvrageSaisi): Promise<Ouvrage | null> => {
    const correction = correctionOuvrage(reference, valeurs);
    if (Object.keys(correction).length === 0) return null;

    const corrige = await modification.mutateAsync({ id: ouvrage.id, correction });
    setReference(referenceDepuisOuvrage(corrige));
    return corrige;
  };

  const formulaire = useSaisieOuvrage({
    enEnvoi: modification.isPending,
    envoyer,
    ouvrirOuvrage,
    quitter: retourAuFonds,
    textes: TEXTES_CORRECTION,
    valeursApresSucces: saisieDepuisOuvrage,
    valeursInitiales: saisieDepuisOuvrage(ouvrage),
    verifier: () => ouvrirOuvrage(ouvrage.id),
  });

  return <FormulaireOuvrageView {...formulaire} />;
};

export const CorrectionOuvrageScreen = ({
  id,
  retourAuFonds,
  ouvrirOuvrage,
}: CorrectionOuvrageScreenProps) => {
  const requete = useBook(id);
  const cadre = {
    libelleQuitter: TEXTES_CORRECTION.libelleQuitter,
    retour: retourAuFonds,
    titre: TEXTES_CORRECTION.titre,
  };

  if (!identifiantUtilisable(id)) {
    return (
      <CorrectionIndisponibleView
        {...cadre}
        etat={{ type: 'introuvable', message: ABSENCE_PAR_DEFAUT }}
      />
    );
  }

  if (requete.data !== undefined) {
    return (
      <FormulaireCorrection
        key={requete.data.id}
        ouvrage={requete.data}
        ouvrirOuvrage={ouvrirOuvrage}
        retourAuFonds={retourAuFonds}
      />
    );
  }

  if (requete.isPending) {
    return <CorrectionIndisponibleView {...cadre} etat={{ type: 'chargement' }} />;
  }

  if (requete.isError) {
    if (requete.error.type === 'introuvable') {
      return (
        <CorrectionIndisponibleView
          {...cadre}
          etat={{ type: 'introuvable', message: requete.error.message }}
        />
      );
    }
    return (
      <CorrectionIndisponibleView
        {...cadre}
        etat={{
          type: 'erreur',
          message: requete.error.message,
          reessayer: () => void requete.refetch(),
        }}
      />
    );
  }

  return <CorrectionIndisponibleView {...cadre} etat={{ type: 'chargement' }} />;
};
