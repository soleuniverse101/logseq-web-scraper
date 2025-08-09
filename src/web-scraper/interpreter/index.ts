import { err, ok, Result } from "neverthrow";
import { Value } from "../data";
import { runtimeErr, RuntimeError } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";
import { applyOperation } from "./operations";
import { loadStandardFunctions } from "./standard-functions";

export type RuntimeResult<T = Value> = Result<T, RuntimeError>;
type ASTNodeEvaluator = {
  [Type in ASTNodeType]: (node: ASTNodeFromType<Type>) => RuntimeResult;
};

export type OutputNode = {
  value: Value;
  children: OutputNode[];
  context: SourceLineContext;
};

export class Interpreter {
  private env = new Environment();
  private sourceContext: SourceLineContext = {
    blockLine: 1,
  } as SourceLineContext;

  private constructor() {
    loadStandardFunctions(this.env);
  }

  private interpret(nodes: Block[], output: OutputNode[]): RuntimeResult<void> {
    for (const node of nodes) {
      this.sourceContext.blockUUID = node.uuid;

      let result = this.evaluate(node.astNode);
      if (result.isErr()) {
        return err(result.error);
      }

      const outputNode: OutputNode = {
        value: result.value,
        children: [],
        context: {
          blockLine: this.sourceContext.blockLine,
          blockUUID: node.uuid,
        },
      };
      output.push(outputNode);

      this.sourceContext.blockLine++;

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
    functionCall: ({ callee, args }) => {
      const funcResult = this.evaluate(callee);
      if (funcResult.isErr()) {
        return funcResult;
      } else if (funcResult.value.type != "Function") {
        return runtimeErr(
          "valueNotCallable",
          funcResult.value,
          this.sourceContext,
        );
      }
      const { value: func } = funcResult.value;

      if (func.inputTypes.length != args.length) {
        return runtimeErr(
          "wrongArgumentsCount",
          {
            expectedCount: func.inputTypes.length,
            actualCount: args.length,
          },
          this.sourceContext,
        );
      }

      const inputs: Value[] = [];
      for (const arg of args) {
        const result = this.evaluate(arg);
        if (result.isErr()) {
          return result;
        }
        inputs.push(result.value);
      }

      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type != func.inputTypes[i]) {
          return runtimeErr(
            "wrongArgumentsTypes",
            {
              expectedTypes: func.inputTypes,
              actualTypes: inputs.map(({ type }) => type),
            },
            this.sourceContext,
          );
        }
      }

      return func.map(inputs, this.env);
    },
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
