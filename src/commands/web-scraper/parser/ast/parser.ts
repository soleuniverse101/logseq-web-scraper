import { ASTNode } from ".";
import { err, ok, Result } from "neverthrow";
import grammar from "./grammar.ohm-bundle";
import { astErr, AstError } from "../../errors/parser-errors";

type ASTResult = Result<ASTNode, AstError>;

const semantics = grammar.createSemantics();

semantics.addAttribute("asToken", {
  url: (_url): ASTResult => {
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

export function parseASTNode(line: string): ASTResult {
  const match = grammar.match(line);
  if (match.failed()) {
    return astErr(match);
  }
  const node: ASTNode | ASTResult = semantics(match).asToken;
  return isASTNode(node) ? ok(node) : node;
}

function isASTNode(obj: ASTNode | ASTResult): obj is ASTNode {
  return "type" in obj;
}
