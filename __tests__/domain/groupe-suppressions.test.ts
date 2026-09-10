import { describe, expect, it } from 'vitest';
import {
  abandonnerAvantEnvoi,
  ajouterAuGroupe,
  annulerGroupe,
  creerEtatGroupeSuppressions,
  DELAI_ANNULATION_SUPPRESSION_MS,
  demarrerEnvoi,
  terminerEnvoi,
} from '../../domain/groupe-suppressions';

const belAmi = { id: 'bel-ami', titre: 'Bel-Ami' };
const germinal = { id: 'germinal', titre: 'Germinal' };

describe('groupe de suppressions différées', () => {
  it('déplace l’échéance commune à cinq secondes après chaque ajout', () => {
    const premier = ajouterAuGroupe(creerEtatGroupeSuppressions(), [belAmi], 0);
    const second = ajouterAuGroupe(premier, [germinal], 1_000);

    expect(premier.echeance).toBe(DELAI_ANNULATION_SUPPRESSION_MS);
    expect(second.ouvrages).toEqual([belAmi, germinal]);
    expect(second.echeance).toBe(6_000);
    expect(demarrerEnvoi(second, 5_000).phase).toBe('attente');
    expect(demarrerEnvoi(second, 6_000).phase).toBe('envoi');
  });

  it('annule tout le groupe avant son envoi', () => {
    const attente = ajouterAuGroupe(creerEtatGroupeSuppressions(), [belAmi, germinal], 0);

    expect(annulerGroupe(attente)).toMatchObject({
      phase: 'repos',
      ouvrages: [],
      echeance: null,
    });
  });

  it('abandonne les intentions non envoyées lors du départ', () => {
    const attente = ajouterAuGroupe(creerEtatGroupeSuppressions(), [belAmi], 0);

    expect(abandonnerAvantEnvoi(attente)).toEqual(annulerGroupe(attente));
  });

  it('ne réaffiche que les ouvrages dont le DELETE échoue', () => {
    const attente = ajouterAuGroupe(creerEtatGroupeSuppressions(), [belAmi, germinal], 0);
    const envoi = demarrerEnvoi(attente, 5_000);

    expect(terminerEnvoi(envoi, [germinal.id])).toMatchObject({
      phase: 'repos',
      ouvrages: [],
      echecs: [germinal],
    });
  });
});
