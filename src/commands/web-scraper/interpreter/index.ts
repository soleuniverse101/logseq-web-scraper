import { err, ok, Result } from "neverthrow";
import { Value, ValueFromType, wrapValue } from "../data";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr, RuntimeError } from "../errors/runtime-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";
import { elementText, fetchPage } from "./interpreter-utils";
import { context, interpretContext } from "./context";

export type RuntimeResult<T = Value> = Promise<Result<T, RuntimeError>>;

type OutputValue = ValueFromType<"String" | "Contexts">;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (
node: ASTNodeFromType<Type>,
) => RuntimeResult<OutputValue>;
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
} else if (result.value.type == "Contexts") {
        await interpretContext(
          this.getHandle(),
          output,
          result.value.value,
          node,
        );
        continue;
      }

      const _outputNode = outputNode(result.value.value, this.currentContext());
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

  private evaluate(node: ASTNode): RuntimeResult<OutputValue> {
    return this.evaluator[node.type](node as any);
  }

  private evaluator: ASTNodeEvaluator = {
block: async ({ selector, modes }) => {
      const element = this.env
        .getReserved("_current")
        .querySelector(selector) as HTMLElement;
      if (!element) {
        return runtimeErr(
          "selectElementNotFound",
          { selector },
          this.currentContext(),
        );
} else if (modes.context == "inline") {
        return ok(
          context((env) => {
            env.loadReserved("_current", element);
          }),
        );
      }

      return ok(wrapValue("String", elementText(element)));
    },

    root: async ({ url }) => {
      const page = await fetchPage(url, this.currentContext());
      if (page.isErr()) {
        return err(page.error);
      }
this.env.loadReserved("_document", page.value);
      this.env.loadReserved("_current", page.value.body);
      return ok(wrapValue("String", page.value.title));
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

  private getHandle(): InterpreterHandle {
    return {
      interpret: this.interpret.bind(this),
      extendScope: this.extendScope.bind(this),
      outScope: this.outScope.bind(this),
      getEnvironment: () => this.env,
      getSourceContext: this.currentContext.bind(this),
    };
  }
}

export interface InterpreterHandle {
  interpret: (nodes: Block[], output: OutputNode[]) => RuntimeResult<void>;
  extendScope: () => void;
  outScope: () => void;
  getEnvironment: () => Environment;
  getSourceContext: () => SourceLineContext;
}
