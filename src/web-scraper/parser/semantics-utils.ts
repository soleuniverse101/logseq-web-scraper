import { NonterminalNode, TerminalNode } from "ohm-js";
import { Expr, Operation } from "./ast";

export const binaryOp = ((left, operation, right): Expr => ({
  type: "binaryOp",
  left: left.asToken,
  operation: operation.sourceString as Operation,
  right: right.asToken,
})) satisfies (
  this: NonterminalNode,
  arg0: NonterminalNode,
  arg1: TerminalNode,
  arg2: NonterminalNode,
) => Expr;
