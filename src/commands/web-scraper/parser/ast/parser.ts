import { ASTExpression, ASTNode, BlockTemplate, isExpression } from ".";
import { err, ok, Result } from "neverthrow";
import grammar, { RefltagActionDict } from "./grammar.ohm-bundle";
import { astErr, AstError } from "../../errors/parser-errors";
import { Mode, Modes } from "../../interpreter/modes";
import { IterationNode } from "ohm-js";
import { wrapValue } from "../../data";

type ASTResult = Result<ASTNode, AstError>;

const semantics = grammar.createSemantics();

const tokens = {
  Block: (quantifier, modes, selector, template) =>
    ok({
      type: "block",
      selector: selector.sourceString,
      quantifier:
        quantifier.numChildren > 0
          ? (quantifier.children[0].children[0].sourceString as "?" | "+" | "*")
          : undefined,
      modes:
        modes.numChildren > 0
          ? modes.children[0].children[0].children // .asIteration()
              .map((mode) => mode.children[1].sourceString as Mode)
              .reduce((modes, mode) => {
                switch (mode) {
                  case "inline":
                  case "block":
                    modes["context"] = mode;
                }
                return modes;
              }, {} as Modes)
          : {},
      template: parseTemplate(template),
    }),

  Root: (_url, template) => {
    let url;
    try {
      url = new URL(_url.sourceString);
    } catch {
      return err(
        new AstError(
          `Invalid URL : ${_url.sourceString}`,
          _url.source.startIdx,
        ),
      );
    }
    return ok({
      type: "root",
      url,
      template: parseTemplate(template),
    });
  },

  identifier: (firstChar, rest) => ({
    type: "identifier",
    name: firstChar.sourceString + rest.sourceString,
  }),
  number: (n) => ({
    type: "literal",
    value: wrapValue("Number", parseInt(n.sourceString)),
  }),
} satisfies RefltagActionDict<ASTResult | ASTNode>;

semantics.addAttribute(
  "asToken",
  tokens as RefltagActionDict<ASTResult | ASTNode>,
);

export function parseASTNode(
  line: string,
  startRule: "Block" | "Root" = "Block",
): ASTResult {
  const match = grammar.match(line, startRule);
  if (match.failed()) {
    return astErr(match);
  }
  const node: ASTNode | ASTResult = semantics(match).asToken;
  return isASTNode(node) ? ok(node) : node;
}

function isASTNode(obj: ASTNode | ASTResult): obj is ASTNode {
  return "type" in obj;
}

function parseTemplate(template: IterationNode) {
  if (template.numChildren == 0) {
    return [null];
  }

  const parts: BlockTemplate = [];
  template
    .child(0)
    .child(1)
    .children.map<string | ASTExpression | null>((node) => {
      if (node.ctorName == "templateText") {
        return node.sourceString;
      }
      const expression = (node.child(1).child(0)?.asToken ?? null) as
        | ASTResult
        | ASTNode
        | null;
      if (!expression) {
        return expression;
      }
      if (isASTNode(expression)) {
        if (!isExpression(expression)) {
          throw new Error("Template escaped text is not an expression");
        }
        return expression;
      } else {
        const resultValue = expression._unsafeUnwrap();
        if (!isExpression(resultValue)) {
          throw new Error("Template escaped text is not an expression");
        }
        return resultValue;
      }
    })
    .forEach((part) => parts.push(part));

  return parts;
}
