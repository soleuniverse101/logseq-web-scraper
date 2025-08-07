import { ok, Result } from "neverthrow";
import { exprErr, ExprError } from "../errors/parser-errors";
import { Expr } from "./ast";
import { wrapValue } from "./data";
import grammar from "./grammar.ohm-bundle";
import { binaryOp, formatString } from "./semantics-utils";

type ExprResult = Result<Expr, ExprError>;

const semantics = grammar.createSemantics();

semantics.addAttribute("asToken", {
  Term_binary: binaryOp,
  Factor_binary: binaryOp,

  identifier: (firstChar, name): Expr => ({
    type: "identifier",
    name: firstChar.sourceString + name.sourceString,
  }),

  number: (n): Expr => ({
    type: "literal",
    value: wrapValue("Number", parseInt(n.sourceString)),
  }),
  string: (_arg0, content, _arg2): Expr => ({
    type: "literal",
    value: wrapValue("String", formatString(content.sourceString)),
  }),
});

export function parseExpr(line: string): ExprResult {
  const match = grammar.match(line);
  if (match.failed()) {
    return exprErr(match);
  }
  return ok(semantics(match).asToken);
}

console.log(parseExpr("3+5/2*5"));
