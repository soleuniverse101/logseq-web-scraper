import { ok, Result } from "neverthrow";
import { exprErr, ExprError } from "../../errors/parser-errors";
import { BlockExpr, Expr } from "./ast";
import grammar from "./grammar.ohm-bundle";

type ExprResult = Result<Expr, ExprError>;

const semantics = grammar.createSemantics();

semantics.addAttribute("asToken", {
  Expr(expr, content, _): BlockExpr {
    return { content: content.sourceString.substring(1), ...expr.asToken };
  },

  fetch(_0, _1, url): Expr {
    try {
      return { type: "fetch", url: new URL(url.sourceString) };
    } catch {
      throw exprErr("invalidUrl", url.source.startIdx);
    }
  },
});

export function parseExpr(line: string): ExprResult {
  try {
    return ok(semantics(grammar.match(line)).asToken);
  } catch (err) {
    return err as ExprResult;
  }
}
