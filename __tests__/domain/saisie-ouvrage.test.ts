import { describe, expect, it } from 'vitest';
import {
  anneeMaximaleAutorisee,
  creerSaisieOuvrageSchema,
  LONGUEUR_MAXIMALE_TEXTE,
  repartirRefusServeur,
  SAISIE_OUVRAGE_VIDE,
} from '../../domain/saisie-ouvrage';
import { creerMessagesSaisieOuvrage } from '../../features/books/messages-saisie';
import { traduireEnTest } from '../outils-traduction';

const saisieOuvrageSchema = creerSaisieOuvrageSchema(creerMessagesSaisieOuvrage(traduireEnTest));

const saisieValide = {
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: '1885',
  lu: false,
};

const messagesParChamp = (saisie: unknown): Record<string, string> => {
  const resultat = saisieOuvrageSchema.safeParse(saisie);
  if (resultat.success) return {};
  return Object.fromEntries(
    resultat.error.issues.map((probleme) => [String(probleme.path[0]), probleme.message]),
  );
};

describe('règles de saisie d’un ouvrage', () => {
  it('ouvre un ajout avec une année vide et le statut « Non lu »', () => {
    expect(SAISIE_OUVRAGE_VIDE).toEqual({
      titre: '',
      auteur: '',
      editeur: '',
      annee: '',
      lu: false,
    });
  });

  it('normalise les espaces périphériques et accepte un éditeur vide', () => {
    const resultat = saisieOuvrageSchema.safeParse({
      titre: '  Bel-Ami  ',
      auteur: '  Guy de Maupassant ',
      editeur: '   ',
      annee: ' 1885 ',
      lu: true,
    });

    expect(resultat.success).toBe(true);
    expect(resultat.success && resultat.data).toEqual({
      titre: 'Bel-Ami',
      auteur: 'Guy de Maupassant',
      editeur: '',
      annee: 1885,
      lu: true,
    });
  });

  it('refuse un titre ou un auteur vide après retrait des espaces', () => {
    const messages = messagesParChamp({ ...saisieValide, titre: '   ', auteur: '' });

    expect(messages.titre).toBe('Le titre est obligatoire.');
    expect(messages.auteur).toBe('L’auteur est obligatoire.');
  });

  it('limite les champs textuels à 200 caractères après normalisation', () => {
    const limite = 'a'.repeat(LONGUEUR_MAXIMALE_TEXTE);
    const accepte = saisieOuvrageSchema.safeParse({
      ...saisieValide,
      titre: ` ${limite} `,
      editeur: limite,
    });
    const messages = messagesParChamp({
      ...saisieValide,
      titre: `${limite}a`,
      auteur: `${limite}a`,
      editeur: `${limite}a`,
    });

    expect(accepte.success).toBe(true);
    expect(messages.titre).toBe('Le titre ne peut pas dépasser 200 caractères.');
    expect(messages.auteur).toBe('L’auteur ne peut pas dépasser 200 caractères.');
    expect(messages.editeur).toBe('L’éditeur ne peut pas dépasser 200 caractères.');
  });

  it('exige une année entière comprise entre 1450 et l’année civile suivante', () => {
    const maximum = anneeMaximaleAutorisee();
    const messageAttendu = `L’année doit être comprise entre 1450 et ${maximum}.`;

    expect(messagesParChamp({ ...saisieValide, annee: '' }).annee).toBe(
      'L’année de publication est obligatoire.',
    );
    expect(messagesParChamp({ ...saisieValide, annee: '1885,5' }).annee).toBe(
      'L’année doit être un nombre entier.',
    );
    expect(messagesParChamp({ ...saisieValide, annee: '1449' }).annee).toBe(messageAttendu);
    expect(messagesParChamp({ ...saisieValide, annee: String(maximum + 1) }).annee).toBe(
      messageAttendu,
    );
    expect(saisieOuvrageSchema.safeParse({ ...saisieValide, annee: '1450' }).success).toBe(true);
    expect(saisieOuvrageSchema.safeParse({ ...saisieValide, annee: String(maximum) }).success).toBe(
      true,
    );
  });

  it('exige un statut de lecture booléen strict', () => {
    expect(saisieOuvrageSchema.safeParse({ ...saisieValide, lu: 'true' }).success).toBe(false);
    expect(saisieOuvrageSchema.safeParse({ ...saisieValide, lu: 1 }).success).toBe(false);
  });

  it('répartit un refus serveur entre les champs du formulaire et le reste', () => {
    const refus = repartirRefusServeur({
      titre: 'ne peut pas etre vide',
      annee: 'annee invalide (1450 - annee prochaine)',
      couverture: '500 caracteres maximum',
    });

    expect(refus.parChamp).toEqual({
      titre: 'ne peut pas etre vide',
      annee: 'annee invalide (1450 - annee prochaine)',
    });
    expect(refus.horsFormulaire).toEqual(['couverture : 500 caracteres maximum']);
  });

  it('ne fabrique aucun refus lorsque la réponse ne détaille pas de champ', () => {
    expect(repartirRefusServeur(undefined)).toEqual({ parChamp: {}, horsFormulaire: [] });
  });
});
