import { err, ok, Result } from "neverthrow";
import { Value } from "../data";
import { RuntimeError } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";
import { applyOperation } from "./operations";

export type RuntimeResult<T = Value> = Result<T, RuntimeError>;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (node: ASTNodeFromType<Type>) => RuntimeResult;
};

export type OutputNode = {
  value: Value;
  children: OutputNode[];
};

export class Interpreter {
  private env = new Environment();
  private sourceContext: SourceLineContext = {
    blockLine: 1,
  } as SourceLineContext;

  private constructor() {}

  private interpret(nodes: Block[], output: OutputNode[]): RuntimeResult<void> {
    for (const node of nodes) {
      this.sourceContext.blockUUID = node.uuid;

      let result = this.evaluate(node.astNode);
      if (result.isErr()) {
        return err(result.error);
      }
      
      this.sourceContext.blockLine++;

      const outputNode: OutputNode = { value: result.value, children: [] };
      output.push(outputNode);

      this.env = this.env.extendScope();
      const exec = this.interpret(node.children, outputNode.children);
      if (exec.isErr()) {
        return exec;
      }
      this.env = this.env.outScope();
    }
    return ok();
  }

  public static interpret(nodes: Block[]): RuntimeResult<OutputNode[]> {
    const output: OutputNode[] = [];
    return new Interpreter().interpret(nodes, output).map(() => output);
  }

  private evaluate(node: ASTNode): RuntimeResult {
    return this.evaluator[node.type](node as any);
  }

  private evaluator: ASTNodeEvaluator = {
    definition: ({ identifier, right }) => {
      const result = this.evaluate(right);
      if (result.isErr()) {
        return result;
      }
      const definition = this.env.define(
        identifier.name,
        result.value,
        this.sourceContext,
      );
      if (definition.isErr()) {
        return err(definition.error);
      }
      return ok(result.value);
    },
    binaryOp: ({ left, operation, right }) => {
      const result = Result.combine([
        this.evaluate(left),
        this.evaluate(right),
      ]);
      if (result.isErr()) {
        return err(result.error);
      }
      return applyOperation(operation, result.value[0], result.value[1]);
    },
    identifier: ({ name }) => {
      return this.env.get(name, this.sourceContext);
    },
    literal: ({ value }) => ok(value),
  } as const;
}
