import { err, ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, wrapNullable } from "../data";
import { runtimeErr } from "../errors/runtime-errors";
import { ASTNode, BlockTemplate } from "../parser/ast";
import { Environment } from "./environment";
import { SourceLineContext } from "../errors/parser-errors";

export function loadElementTemplateData(
  element: HTMLElement,
  env: Environment,
) {
  const tagName = element.tagName.toLowerCase();
  if (tagName == "a") {
    const href = element.getAttribute("href");
    env.load("href", wrapNullable("String", href));
    env.load(
      "fullHref",
      wrapNullable(
        "String",
        href
          ? (URL.parse(href, env.getReserved("_documentUrl"))?.toString() ??
              null)
          : null,
      ),
    );
  }
}

export async function interpretTemplate(
  template: BlockTemplate,
  defaultText: string,
  interpreter: TemplateInterpreter,
): RuntimeResult<string> {
  let output = "";

  for (const part of template) {
    if (typeof part == "string") {
      output += part;
    } else if (part) {
      const expr = await interpreter.evaluate(part);
      if (expr.isErr()) {
        return err(expr.error);
      } else if (expr.value.type != "String") {
        return runtimeErr(
          "nonStringTemplateExpression",
          { actualType: expr.value.type },
          interpreter.currentSourceContext(),
        );
      }
      output += expr.value.value;
    } else {
      output += defaultText;
    }
  }

  return ok(output);
}

export interface TemplateInterpreter {
  evaluate(node: ASTNode): RuntimeResult<Value>;
  currentSourceContext(): Readonly<SourceLineContext>;
}
