import { err, ok, Result } from "neverthrow";
import { Value, wrapValue } from "../data";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr, RuntimeError } from "../errors/runtime-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";
import { fetchPage } from "./interpreter-utils";

export type RuntimeResult<T = Value> = Promise<Result<T, RuntimeError>>;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (node: ASTNodeFromType<Type>) => RuntimeResult<string>;
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
      }

      const _outputNode = outputNode(result.value, this.currentContext());
      output.push(_outputNode);

      const interpretChildren = await this.interpret(
        node.children,
        _outputNode.children,
      );
      if (interpretChildren.isErr()) {
        return interpretChildren;
      }

      this.outScope();
    }
    return ok();
  }

  public static async interpret(nodes: Block[]): RuntimeResult<OutputNode[]> {
    const output: OutputNode[] = [];
    return (await new Interpreter().interpret(nodes, output)).map(() => output);
  }

  private evaluate(node: ASTNode): RuntimeResult<string> {
    return this.evaluator[node.type](node as any);
  }

  private evaluator: ASTNodeEvaluator = {
block: async ({ selector }) => {
      const element = this.env
        .getReserved("_document")
        .body.querySelector(selector);

      if (!element) {
        return runtimeErr(
          "selectElementNotFound",
          { selector },
          this.currentContext(),
        );
      }

      return ok(element.textContent);
    },

    root: async ({ url }) => {
      const page = await fetchPage(url, this.currentContext());
      if (page.isErr()) {
        return err(page.error);
      }
this.env.loadReserved("_document", wrapValue("HtmlDocument", page.value));
      return ok(page.value.title);
    },
  } as const;

  private extendScope() {
    this.env = this.env.extendScope();
  }
  private outScope() {
    this.env = this.env.outScope();
  }
  private currentContext(): Readonly<SourceLineContext> {
    return {
      blockLine: this.sourceContext.blockLine,
      blockUUID: this.sourceContext.blockUUID,
    };
  }
}
