import { err, ok } from "neverthrow";
import { Value, ValueFromType, ValueType, wrapValue } from ".";
import { RuntimeResult } from "../interpreter";
import { isResult } from "../scraper-utils";
import { Environment } from "../interpreter/environment";
import { SourceLineContext } from "../errors/parser-errors";

export type StandardFunction = {
  // Can be empty
  inputTypes: ValueType[];
  outputType: ValueType;
  map: (
    inputs: Value[],
    env: Environment,
    sourceContext: SourceLineContext,
  ) => RuntimeResult;
};

export function createFunction<
  Inputs extends ValueType[],
  Output extends ValueType,
>(
  inputTypes: [...Inputs],
  outputType: Output,
  map: (
    inputs: {
      [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
    },
    env: Environment,
    sourceContext: SourceLineContext,
  ) =>
    | ValueFromType<Output>["value"]
    | Promise<ValueFromType<Output>["value"]>
    | RuntimeResult<ValueFromType<Output>["value"]>,
): StandardFunction {
  return {
    inputTypes,
    outputType,
    map: async (inputs, env, sourceContext) => {
      const result = await map(
        inputs.map(({ value }) => value) as {
          [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
        },
        env,
        sourceContext,
      );

      if (isResult(result)) {
        if (result.isErr()) {
          return err(result.error);
        }
        return ok(wrapValue(outputType, result.value));
      }
      return ok(wrapValue(outputType, result));
    },
  };
}
