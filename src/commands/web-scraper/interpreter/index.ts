import { err, ok, Result } from "neverthrow";
import { Value, wrapContexts } from "../data";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr, RuntimeError } from "../errors/runtime-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";
import {
  elementText,
  defaultFetchPage,
  FetchPage,
  zipByUUID,
} from "./interpreter-utils";
import { outputNode, OutputNode } from "./output";
import {
  interpretTemplate,
  loadElementTemplateData,
  TemplateInterpreter,
} from "./template";
import { context } from "./context/context-utils";
import { Contexts } from "./context";

export type RuntimeResult<T = Value> = Promise<Result<T, RuntimeError>>;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (node: ASTNodeFromType<Type>) => RuntimeResult<Value>;
};

export class Interpreter {
  private env = new Environment();
  // Must be updated first before use
  private sourceContext: SourceLineContext = {
    blockLine: 0,
  } as SourceLineContext;
  private templateInterpeter: TemplateInterpreter = {
    evaluate: (node) => {
      return this.evaluate(node);
    },
    currentSourceContext: () => {
      return this.currentSourceContext();
    },
  };
  private fetchPage: FetchPage;

  private constructor(fetchPage: FetchPage) {
    this.fetchPage = fetchPage;
  }

  private async interpret(
    nodes: Block[],
    output: OutputNode[],
  ): RuntimeResult<void> {
    for (const node of nodes) {
      this.sourceContext.blockLine++;
      this.sourceContext.blockUUID = node.uuid;

      const sourceContext = this.currentSourceContext();

      // this.extendScope();

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

      for (const context of result.value.value) {
        this.extendScope();

        if (context.prepare) {
          const prepare = await context.prepare(this.env);
          if (prepare.isErr()) {
            return err(prepare.error);
          }
        }

        const childrenOutput: OutputNode[] = [];
        const childrenExec = await this.interpret(
          node.children,
          childrenOutput,
        );
        if (childrenExec.isErr()) {
          return err(childrenExec.error);
        }

        const content = await context.execute(
          this.env,
          childrenOutput,
          sourceContext,
        );
        if (content.isErr()) {
          return err(content.error);
        }

        this.outScope();

        if (typeof content.value == "string") {
          output.push(outputNode(content.value, sourceContext, childrenOutput));
        } else {
          output.push(...childrenOutput);
        }
      }
    }
    return ok();
  }

  public static async interpret(
    nodes: Block[],
    fetchPage: FetchPage = defaultFetchPage,
  ): RuntimeResult<OutputNode[]> {
    const output: OutputNode[] = [];
    return (await new Interpreter(fetchPage).interpret(nodes, output)).map(
      () => output,
    );
  }

  private evaluate(node: ASTNode): RuntimeResult<Value> {
    return this.evaluator[node.type](node as any);
  }

  private evaluator: ASTNodeEvaluator = {
    block: async ({ template, quantifier, selector, modes }) => {
      const current = this.env.getReserved("_current");

      const contexts: Contexts = [];
      const addContext = (
        getElements: (current: HTMLElement) => Result<HTMLElement[], void>,
      ) => {
        const elements = getElements(current);

        if (elements.isErr()) {
          return runtimeErr(
            "selectElementNotFound",
            { selector },
            this.currentSourceContext(),
          );
        }

        for (const element of elements.value) {
          contexts.push(
            context(
              async (env) => {
                loadElementTemplateData(element, env);
                return interpretTemplate(
                  template,
                  elementText(element),
                  this.templateInterpeter,
                );
              },
              async (env) => {
                return ok(env.loadReserved("_current", element));
              },
            ),
          );
        }

        return ok();
      };

      let result;
      if (!quantifier || quantifier == "?") {
        result = addContext((current) => {
          const element = current.querySelector<HTMLElement>(selector);

          if (!element) {
            return quantifier == "?" ? ok([]) : err();
          }

          return ok([element]);
        });
      } else {
        result = addContext((current) => {
          const elements = current.querySelectorAll<HTMLElement>(selector);

          if (elements.length == 0 && quantifier == "+") {
            return err();
          }

          return ok(Array.from(elements));
        });
      }

      if (result.isErr()) {
        return result;
      }

      for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i];

        if (modes.inline) {
          context.execute = async () => ok();
        }
        if (modes.zip) {
          const execute = context.execute;
          context.execute = async (env, childrenOutput, sourceContext) => {
            const groups = zipByUUID(childrenOutput);
            const parentContent = await execute(
              env,
              childrenOutput,
              sourceContext,
            );
            if (parentContent.isErr()) {
              return parentContent;
            }

            const children: OutputNode[] = [];

            for (const group of groups) {
              if (typeof parentContent.value == "string") {
                children.push(
                  outputNode(parentContent.value, sourceContext, group),
                );
              } else {
                children.push(...group);
              }
            }

            childrenOutput.splice(0);
            childrenOutput.push(...children);

            return ok();
          };
        }
      }

      return ok(wrapContexts(...contexts));
    },

    root: async ({ url, template }) => {
      const page = await this.fetchPage(url, this.currentSourceContext());
      if (page.isErr()) {
        return err(page.error);
      }

      return ok(
        wrapContexts(
          context(
            async (env) => {
              loadElementTemplateData(page.value.body, env);

              return interpretTemplate(
                template,
                page.value.title,
                this.templateInterpeter,
              );
            },
            async (env) => {
              env.loadReserved("_document", page.value);
              env.loadReserved("_documentUrl", url.toString());
              env.loadReserved("_current", page.value.body);

              return ok();
            },
          ),
        ),
      );
    },
    identifier: async ({ name }) =>
      this.env.get(name, this.currentSourceContext()),
    literal: async ({ value }) => ok(value),
  } as const;

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
