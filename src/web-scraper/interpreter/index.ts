import { err, ok, Result } from "neverthrow";
import { Value, wrapValue } from "../data";
import { runtimeErr, RuntimeError } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";
import { ASTNode, ASTNodeFromType, ASTNodeType } from "../parser/ast";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";
import { applyOperation } from "./operations";
import { loadStandardFunctions } from "./standard/standard-functions";
import { reservedVariables } from "./standard/standard-variables";
import { interpretSystemCall } from "./system";

export type RuntimeResult<T = Value> = Promise<Result<T, RuntimeError>>;
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
    blockLine: 0,
  } as SourceLineContext;

  private constructor() {
    loadStandardFunctions(this.env);
    this.env.loadReserved("_", wrapValue("Object", new Map()));
  }

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
      } else if (result.value.type == "SystemCall") {
        await interpretSystemCall(
          this.getHandle(),
          output,
          result.value.value,
          node,
        );
        continue;
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

      const exec = await this.interpret(node.children, outputNode.children);
      if (exec.isErr()) {
        return exec;
      }
      this.outScope();
    }
    return ok();
  }

  public static async interpret(nodes: Block[]): RuntimeResult<OutputNode[]> {
    const output: OutputNode[] = [];
    return (await new Interpreter().interpret(nodes, output)).map(() => output);
  }

  private evaluate(node: ASTNode): RuntimeResult {
    return this.evaluator[node.type](node as any);
  }

  private evaluator: ASTNodeEvaluator = {
    definition: async ({ identifier, right }) => {
      const result = await this.evaluate(right);
      if (result.isErr()) {
        return result;
      }
      const definition = await this.env.define(
        identifier.name,
        result.value,
        this.sourceContext,
      );
      if (definition.isErr()) {
        return err(definition.error);
      }
      return ok(result.value);
    },
    object: async ({ mappings }) => {
      const map: Map<string, Value> = new Map();
      for (const { key, value } of mappings) {
        if (map.has(key)) {
          return runtimeErr("usedObjectProperty", { key }, this.sourceContext);
        }
        const result = await this.evaluate(value);
        if (result.isErr()) {
          return result;
        }
        map.set(key, result.value);
      }
      return ok({ type: "Object", value: map });
    },
    array: async ({ elements: _elements }) => {
      const elements: Value[] = [];
      for (const element of _elements) {
        const result = await this.evaluate(element);
        if (result.isErr()) {
          return result;
        }
        elements.push(result.value);
      }
      return ok({ type: "Array", value: elements });
    },
    lambda: async ({ parameters, body }) => {
      for (const { name } of parameters) {
        if (reservedVariables.includes(name)) {
          return runtimeErr("reservedIdentifier", { name }, this.sourceContext);
        }
      }
      return ok(wrapValue("UserFunction", { parameters, body }));
    },
    propertyAccess: async ({ object: _object, property }) => {
      const objectResult = await this.evaluate(_object);
      if (objectResult.isErr()) {
        return objectResult;
      } else if (objectResult.value.type != "Object") {
        return runtimeErr("propertyAccessOnNonObject", {}, this.sourceContext);
      }

      const { value: object } = objectResult.value;
      const propertyValue = object.get(property.name);

      if (!propertyValue) {
        return runtimeErr(
          "undefinedObjectProperty",
          { property: property.name },
          this.sourceContext,
        );
      }

      return ok(propertyValue);
    },
    functionCall: async ({ callee, args }) => {
      const funcResult = await this.evaluate(callee);
      if (funcResult.isErr()) {
        return funcResult;
      } else if (
        funcResult.value.type != "StandardFunction" &&
        funcResult.value.type != "UserFunction"
      ) {
        return runtimeErr(
          "valueNotCallable",
          funcResult.value,
          this.sourceContext,
        );
      }

      const inputs: Value[] = [];
      for (const arg of args) {
        const result = await this.evaluate(arg);
        if (result.isErr()) {
          return result;
        }
        inputs.push(result.value);
      }

      if (funcResult.value.type == "UserFunction") {
        const { value: func } = funcResult.value;

        this.env = this.env.extendScope();
        for (let i = 0; i < func.parameters.length; i++) {
          const definition = await this.env.define(
            func.parameters[i].name,
            inputs[i],
            this.sourceContext,
          );
          if (definition.isErr()) {
            return err(definition.error);
          }
        }
        const result = await this.evaluate(func.body);
        if (result.isErr()) {
          return result;
        }
        this.env = this.env.outScope();

        return result;
      }

      const { value: func } = funcResult.value;

      return func.map(inputs, this.env, this.sourceContext);
    },
    binaryOp: async ({ left, operation, right }) => {
      const result = Result.combine([
        await this.evaluate(left),
        await this.evaluate(right),
      ]);
      if (result.isErr()) {
        return err(result.error);
      }
      return applyOperation(
        operation,
        result.value[0],
        result.value[1],
        this.sourceContext,
      );
    },
    identifier: async ({ name }) => {
      return this.env.get(name, this.sourceContext);
    },
    literal: async ({ value }) => ok(value),
  } as const;

  private extendScope() {
    this.env = this.env.extendScope();
  }
  private outScope() {
    this.env = this.env.outScope();
  }

  private getHandle(): InterpreterHandle {
    return {
      interpret: this.interpret.bind(this),
      extendScope: this.extendScope.bind(this),
      outScope: this.outScope.bind(this),
      getEnvironment: () => this.env,
      getSourceContext: () => ({
        blockLine: this.sourceContext.blockLine,
        blockUUID: this.sourceContext.blockUUID,
      }),
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
