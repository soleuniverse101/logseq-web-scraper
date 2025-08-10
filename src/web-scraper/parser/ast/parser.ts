import { ok, Result } from "neverthrow";
import { ASTNode } from ".";
import { wrapValue } from "../../data";
import { astErr, AstError } from "../../errors/parser-errors";
import grammar from "./grammar.ohm-bundle";
import { binaryOp, formatString } from "./semantics-utils";

type ASTResult = Result<ASTNode, AstError>;

const semantics = grammar.createSemantics();

semantics.addAttribute("asToken", {
  Definition: (_arg0, identifier, _arg2, expr): ASTNode => ({
    type: "definition",
    identifier: identifier.asToken,
    right: expr.asToken,
  }),

  Lambda_parenthesized: (_arg0, parameters, _arg2, _arg3, body): ASTNode => ({
    type: "lambda",
    parameters: parameters.asIteration().children.map(({ sourceString }) => ({
      type: "identifier",
      name: sourceString,
    })),
    body: body.asToken,
  }),
  Lambda_freeForm: (parameter, _arg1, body): ASTNode => ({
    type: "lambda",
    parameters: [
      {
        type: "identifier",
        name: parameter.sourceString,
      },
    ],
    body: body.asToken,
  }),

  FunctionCall_parenthesized: (callee, _arg1, args, _arg3): ASTNode => ({
    type: "functionCall",
    callee: callee.asToken,
    args: args.asIteration().children.map((arg) => arg.asToken),
  }),
  FunctionCall_freeForm: (callee, args): ASTNode => ({
    type: "functionCall",
    callee: callee.asToken,
    args: args.asIteration().children.map((arg) => arg.asToken),
  }),

  Term_binary: binaryOp,
  Factor_binary: binaryOp,

  Primary_parenthesized: (_arg0, expression, _arg2): ASTNode =>
    expression.asToken,

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
    return astErr(match);
  }
  return ok(semantics(match).asToken);
}
