import { err, ok, Result } from "neverthrow";
import { Value } from "../data";
import { Environment } from "../errors/environment";
import { runtimeErr, RuntimeError } from "../errors/interpreter-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { applyOperation } from "./operations";

export type RuntimeResult<T = Value> = Result<T, RuntimeError>;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (node: ASTNodeFromType<Type>) => RuntimeResult;
};

export class Interpreter {
  private env = new Environment();

  public interpret(nodes: ASTNode[]) {
    for (const node of nodes) {
      console.log(this.evaluate(node));
    }
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
      const definition = this.env.define(identifier.name, result.value);
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
      return this.env.get(name);
    },
    literal: ({ value }) => ok(value),
  } as const;
}
