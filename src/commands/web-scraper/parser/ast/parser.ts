import { ASTNode, Mode } from ".";
import { err, ok, Result } from "neverthrow";
import grammar from "./grammar.ohm-bundle";
import { astErr, AstError } from "../../errors/parser-errors";

type ASTResult = Result<ASTNode, AstError>;

const semantics = grammar.createSemantics();

semantics.addAttribute("asToken", {
  Block: (quantifier, modes, selector): ASTResult =>
    ok({
      type: "block",
      selector: selector.sourceString,
      quantifier:
        quantifier.numChildren > 0
          ? (quantifier.children[0].children[0].sourceString as "?" | "+" | "*")
          : undefined,
      modes:
        modes.numChildren > 0
          ? modes.children[0].children[0]
              .asIteration()
              .children.map((mode) => mode.children[1].sourceString as Mode)
          : [],
    }),

  Root: (_url): ASTResult => {
    try {
      return ok({
        type: "root",
        url: new URL(_url.sourceString),
      });
    } catch {
      return err(new AstError("Invalid URL", _url.source.startIdx));
    }
  },
});

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
