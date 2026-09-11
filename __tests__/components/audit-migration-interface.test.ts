import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

type TypeEcart = 'texte' | 'libelle-accessible' | 'couleur';
type Ecart = { fichier: string; ligne: number; type: TypeEcart; valeur: string };

const RACINE = process.cwd();
const DOSSIERS_INTERFACE = ['app', 'components', 'features'] as const;
const ATTRIBUTS_ACCESSIBLES = new Set([
  'alt',
  'aria-description',
  'aria-label',
  'accessibilityLabel',
  'accessibilityHint',
  'placeholder',
  'title',
]);

const fichiersInterface = (dossier: string): string[] =>
  readdirSync(dossier, { withFileTypes: true }).flatMap((entree) => {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) return fichiersInterface(chemin);
    return entree.isFile() && /\.tsx?$/u.test(chemin) ? [chemin] : [];
  });

const estLitteralTexte = (
  noeud: ts.Node,
): noeud is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
  ts.isStringLiteral(noeud) || ts.isNoSubstitutionTemplateLiteral(noeud);

const valeurVisible = (noeud: ts.Node): string | null => {
  if (ts.isJsxText(noeud)) return /[A-Za-zÀ-ÿ]/u.test(noeud.text) ? noeud.text.trim() : null;
  if (!ts.isJsxExpression(noeud) || !noeud.expression || !estLitteralTexte(noeud.expression)) {
    return null;
  }
  return /[A-Za-zÀ-ÿ]/u.test(noeud.expression.text) ? noeud.expression.text : null;
};

const nomPropriete = (noeud: ts.PropertyName): string =>
  ts.isIdentifier(noeud) || ts.isStringLiteral(noeud) ? noeud.text : noeud.getText();

const estTexteValeurAccessible = (noeud: ts.Node): boolean => {
  if (!ts.isPropertyAssignment(noeud) || nomPropriete(noeud.name) !== 'text') return false;
  let parent: ts.Node | undefined = noeud.parent;
  while (parent && !ts.isJsxAttribute(parent)) parent = parent.parent;
  return parent?.name.getText() === 'accessibilityValue';
};

const typeEcart = (noeud: ts.Node): TypeEcart | null => {
  if (valeurVisible(noeud)) return 'texte';
  if (
    ts.isJsxAttribute(noeud) &&
    ATTRIBUTS_ACCESSIBLES.has(noeud.name.getText()) &&
    noeud.initializer &&
    estLitteralTexte(noeud.initializer)
  ) {
    return 'libelle-accessible';
  }
  if (
    ts.isPropertyAssignment(noeud) &&
    estLitteralTexte(noeud.initializer) &&
    estTexteValeurAccessible(noeud)
  ) {
    return 'libelle-accessible';
  }
  if (
    ts.isPropertyAssignment(noeud) &&
    /color$/iu.test(nomPropriete(noeud.name)) &&
    estLitteralTexte(noeud.initializer)
  ) {
    return 'couleur';
  }
  return null;
};

const valeurEcart = (noeud: ts.Node): string => {
  const visible = valeurVisible(noeud);
  if (visible) return visible;
  if (ts.isJsxAttribute(noeud) && noeud.initializer && estLitteralTexte(noeud.initializer)) {
    return noeud.initializer.text;
  }
  return ts.isPropertyAssignment(noeud) && estLitteralTexte(noeud.initializer)
    ? noeud.initializer.text
    : '';
};

const auditerFichier = (fichier: string): Ecart[] => {
  const source = ts.createSourceFile(
    fichier,
    readFileSync(fichier, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    fichier.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const ecarts: Ecart[] = [];
  const visiter = (noeud: ts.Node) => {
    const type = typeEcart(noeud);
    if (type) {
      ecarts.push({
        fichier: relative(RACINE, fichier),
        ligne: source.getLineAndCharacterOfPosition(noeud.getStart()).line + 1,
        type,
        valeur: valeurEcart(noeud),
      });
    }
    ts.forEachChild(noeud, visiter);
  };
  visiter(source);
  return ecarts;
};

const ecarts = DOSSIERS_INTERFACE.flatMap((dossier) => fichiersInterface(join(RACINE, dossier)))
  .flatMap(auditerFichier)
  .map(({ fichier, ligne, type, valeur }) => `${fichier}:${ligne} [${type}] ${valeur}`);

describe('contraction de la migration de l’interface', () => {
  it('ne laisse aucun texte, libellé accessible ou couleur littérale dans les composants', () => {
    expect(ecarts).toEqual([]);
  });
});
