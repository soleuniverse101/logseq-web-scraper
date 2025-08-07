import { NonterminalNode, TerminalNode } from "ohm-js";
import { ASTNode, Operation } from ".";

export const binaryOp = ((left, operation, right): ASTNode => ({
  type: "binaryOp",
  left: left.asToken,
  operation: operation.sourceString as Operation,
  right: right.asToken,
})) satisfies (
  this: NonterminalNode,
  arg0: NonterminalNode,
  arg1: TerminalNode,
  arg2: NonterminalNode,
) => ASTNode;

export function formatString(str: string) {
  return str.replace(String.raw`\"`, String.raw`"`);
}
