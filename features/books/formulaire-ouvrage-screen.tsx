import { FormulaireOuvrageView } from '@/components/books/formulaire-ouvrage-view';
import { SAISIE_OUVRAGE_VIDE } from '@/domain/saisie-ouvrage';
import { useCreerOuvrage } from '@/hooks/use-creer-ouvrage';
import { useTraduction } from '@/hooks/use-traduction';
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

  const formulaire = useSaisieOuvrage({
    enEnvoi: creation.isPending,
    envoyer: (valeurs) => creation.mutateAsync(valeurs),
    ouvrirOuvrage,
    quitter: retourAuFonds,
    textes: creerTextesCreation(t),
    valeursApresSucces: () => SAISIE_OUVRAGE_VIDE,
    valeursInitiales: SAISIE_OUVRAGE_VIDE,
    verifier: retourAuFonds,
  });

  return <FormulaireOuvrageView {...formulaire} />;
};
