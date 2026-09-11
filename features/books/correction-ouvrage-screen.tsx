import { useMemo, useState } from 'react';
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
import { useTraduction } from '@/hooks/use-traduction';
import { messageErreurApplication } from '@/services/i18n/message-erreur-application';
import { creerTextesCorrection } from './textes-ecriture';
import { useSaisieOuvrage } from './use-saisie-ouvrage';

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
  const t = useTraduction();
  const textes = useMemo(() => creerTextesCorrection(t), [t]);
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
    textes,
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
  const t = useTraduction();
  const textes = useMemo(() => creerTextesCorrection(t), [t]);
  const cadre = {
    libelleQuitter: textes.libelleQuitter,
    retour: retourAuFonds,
    titre: textes.titre,
  };

  if (!identifiantUtilisable(id)) {
    return (
      <CorrectionIndisponibleView
        {...cadre}
        etat={{ type: 'introuvable', message: t('fiche.absenceParDefaut') }}
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
          etat={{ type: 'introuvable', message: messageErreurApplication(requete.error, t) }}
        />
      );
    }
    return (
      <CorrectionIndisponibleView
        {...cadre}
        etat={{
          type: 'erreur',
          message: messageErreurApplication(requete.error, t, t('erreursHttp.reponseFiche')),
          reessayer: () => void requete.refetch(),
        }}
      />
    );
  }

  return <CorrectionIndisponibleView {...cadre} etat={{ type: 'chargement' }} />;
};
