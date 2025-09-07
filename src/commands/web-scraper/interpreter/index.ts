import { err, ok, Result } from "neverthrow";
import { Value, wrapNullable } from "../data";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr, RuntimeError } from "../errors/runtime-errors";
import {
  ASTNode,
  ASTNodeFromType,
  ASTNodeType,
  BlockTemplate,
} from "../parser/ast";
import { Block } from "../parser/blocks";
import { context, contexts, Contexts, emptyContext } from "./context";
import { Environment } from "./environment";
import { elementText, fetchPage } from "./interpreter-utils";

export type RuntimeResult<T = Value> = Promise<Result<T, RuntimeError>>;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (node: ASTNodeFromType<Type>) => RuntimeResult<Value>;
};

export type OutputNode = {
  content: string;
  children: OutputNode[];
  context: SourceLineContext;
};

export function outputNode(
  content: string,
  sourceContext: Readonly<SourceLineContext>,
  children: OutputNode[] = [],
): OutputNode {
  return { content, children, context: sourceContext };
}

export class Interpreter {
  private env = new Environment();
  private sourceContext: SourceLineContext = {
    blockLine: 0,
  } as SourceLineContext;

  private async interpret(
    nodes: Block[],
    output: OutputNode[],
  ): RuntimeResult<void> {
    for (const node of nodes) {
      this.sourceContext.blockLine++;
      this.sourceContext.blockUUID = node.uuid;

      this.extendScope();

      let result = await this.evaluate(node.astNode);
      if (result.isErr()) {
        return err(result.error);
      } else if (result.value.type != "Contexts") {
        throw new Error(
          `Blocks shouldn't be able to evaluate to anything other than Contexts (evaluated to ${
            result.value.type
          })`,
        );
      }

      for (const { execute } of result.value.value) {
        const content = await execute(this.env);

        if (content.isErr()) {
          return err(content.error);
        }

        let outputScope = output;
        if (content.value) {
          const _outputNode = outputNode(
            content.value,
            this.currentSourceContext(),
          );
          outputScope.push(_outputNode);
          outputScope = _outputNode.children;
        }

        this.extendScope();

        const exec = await this.interpret(node.children, outputScope);
        if (exec.isErr()) {
          return exec;
        }

        this.outScope();
      }
    }
    return ok();
  }

  public static async interpret(nodes: Block[]): RuntimeResult<OutputNode[]> {
    const output: OutputNode[] = [];
    return (await new Interpreter().interpret(nodes, output)).map(() => output);
  }

  private evaluate(node: ASTNode): RuntimeResult<Value> {
    return this.evaluator[node.type](node as any);
  }

  private evaluator: ASTNodeEvaluator = {
    block: async ({ selector, modes, template, quantifier }) => {
      const current = this.env.getReserved("_current");

      if (!quantifier || quantifier == "?") {
        const element = current.querySelector<HTMLElement>(selector);

        if (!element) {
          if (quantifier == "?") {
            return ok(emptyContext());
          }
          return runtimeErr(
            "selectElementNotFound",
            { selector },
            this.currentSourceContext(),
          );
        } else if (modes.context == "inline") {
          return ok(
            context(async (env) => {
              env.loadReserved("_current", element);
              Interpreter.loadElementTemplateData(element, env);
              return ok();
            }),
          );
        }

        return ok(
          context((env) => {
            this.env.loadReserved("_current", element);
            Interpreter.loadElementTemplateData(element, env);
            return this.interpretTemplate(template, elementText(element));
          }),
        );
      }

      const elements = current.querySelectorAll<HTMLElement>(selector);

      if (elements.length == 0) {
        if (quantifier == "*") {
          return ok(emptyContext());
        }
        return runtimeErr(
          "selectElementNotFound",
          { selector },
          this.currentSourceContext(),
        );
      }

      const _contexts: Contexts = [];
      for (const element of elements) {
        if (modes.context == "inline") {
          _contexts.push({
            execute: async (env) => {
              env.loadReserved("_current", element);
              Interpreter.loadElementTemplateData(element, env);
              return ok();
            },
          });
          continue;
        }

        const output = await this.interpretTemplate(
          template,
          elementText(element),
        );
        if (output.isErr()) {
          return err(output.error);
        }

        _contexts.push({
          execute: async (env) => {
            env.loadReserved("_current", element);
            Interpreter.loadElementTemplateData(element, env);
            return ok(output.value);
          },
        });
      }

      return ok(contexts(..._contexts));
    },

    root: async ({ url, template }) =>
      ok(
        context(async (env) => {
          const page = await fetchPage(url, this.currentSourceContext());
          if (page.isErr()) {
            return err(page.error);
          }

          env.loadReserved("_document", page.value);
          env.loadReserved("_documentUrl", url.toString());
          env.loadReserved("_current", page.value.body);
          Interpreter.loadElementTemplateData(page.value.body, env);

          return this.interpretTemplate(template, page.value.title);
        }),
      ),
    identifier: async ({ name }) => this.env.get(name, this.sourceContext),
    literal: async ({ value }) => ok(value),
  } as const;

  private async interpretTemplate(
    template: BlockTemplate,
    defaultText: string,
  ): RuntimeResult<string> {
    let output = "";

    for (const part of template) {
      if (typeof part == "string") {
        output += part;
      } else if (part) {
        const expr = await this.evaluate(part);
        if (expr.isErr()) {
          return err(expr.error);
        } else if (expr.value.type != "String") {
          return runtimeErr(
            "nonStringTemplateExpression",
            { actualType: expr.value.type },
            this.currentSourceContext(),
          );
        }
        output += expr.value.value;
      } else {
        output += defaultText;
      }
    }

    return ok(output);
  }

  private static loadElementTemplateData(
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

  private extendScope() {
    this.env = this.env.extendScope();
  }
  private outScope() {
    this.env = this.env.outScope();
  }
  private currentSourceContext(): Readonly<SourceLineContext> {
    return {
      blockLine: this.sourceContext.blockLine,
      blockUUID: this.sourceContext.blockUUID,
    };
  }
}
