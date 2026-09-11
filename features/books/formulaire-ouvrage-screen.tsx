import { useState } from 'react';
import { FormulaireOuvrageView } from '@/components/books/formulaire-ouvrage-view';
import type { Ouvrage } from '@/domain/ouvrage';
import { type OuvrageSaisi, SAISIE_OUVRAGE_VIDE } from '@/domain/saisie-ouvrage';
import { useCreerOuvrage } from '@/hooks/use-creer-ouvrage';
import { useTraduction } from '@/hooks/use-traduction';
import { genererUrlCouverture } from '@/services/couvertures';
import { creerTextesCreation } from './textes-ecriture';
import { useSaisieOuvrage } from './use-saisie-ouvrage';

type FormulaireOuvrageScreenProps = {
  retourAuFonds: () => void;
  ouvrirOuvrage: (id: string) => void;
};

export const FormulaireOuvrageScreen = ({
  retourAuFonds,
  ouvrirOuvrage,
}: FormulaireOuvrageScreenProps) => {
  const t = useTraduction();
  const creation = useCreerOuvrage();
  const [couverture, setCouverture] = useState(genererUrlCouverture);

  const envoyer = async (saisie: OuvrageSaisi): Promise<Ouvrage> => {
    const ouvrage = await creation.mutateAsync({ saisie, couverture });
    setCouverture(genererUrlCouverture());
    return ouvrage;
  };

  const formulaire = useSaisieOuvrage({
    enEnvoi: creation.isPending,
    envoyer,
    ouvrirOuvrage,
    quitter: retourAuFonds,
    textes: creerTextesCreation(t),
    valeursApresSucces: () => SAISIE_OUVRAGE_VIDE,
    valeursInitiales: SAISIE_OUVRAGE_VIDE,
    verifier: retourAuFonds,
  });

  return <FormulaireOuvrageView {...formulaire} />;
};
