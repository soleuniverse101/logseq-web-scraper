import { ok, Result } from "neverthrow";
import { ASTNode } from ".";
import { wrapValue } from "../../data";
import { exprErr, ExprError } from "../../errors/parser-errors";
import grammar from "./grammar.ohm-bundle";
import { binaryOp, formatString } from "./semantics-utils";

type ASTResult = Result<ASTNode, ExprError>;

const semantics = grammar.createSemantics();

semantics.addAttribute("asToken", {
  Definition: (_arg0, identifier, _arg2, expr): ASTNode => ({
    type: "definition",
    identifier: identifier.asToken,
    right: expr.asToken,
  }),

  Term_binary: binaryOp,
  Factor_binary: binaryOp,

  identifier: (firstChar, name): ASTNode => ({
    type: "identifier",
    name: firstChar.sourceString + name.sourceString,
  }),

  number: (n): ASTNode => ({
    type: "literal",
    value: wrapValue("Number", parseInt(n.sourceString)),
  }),
  string: (_arg0, content, _arg2): ASTNode => ({
    type: "literal",
    value: wrapValue("String", formatString(content.sourceString)),
  }),
});

export function parseASTNode(line: string): ASTResult {
  const match = grammar.match(line);
  if (match.failed()) {
    return exprErr(match);
  }
  return ok(semantics(match).asToken);
}
