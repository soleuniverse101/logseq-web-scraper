import { err, ok } from "neverthrow";
import { Value, ValueFromType, ValueType, wrapValue } from ".";
import { RuntimeResult } from "../interpreter";
import { isResult } from "../scraper-utils";
import { Environment } from "../interpreter/environment";

export type StandardFunction = {
  // Can be empty
  inputTypes: ValueType[];
  outputType: ValueType;
  map: (inputs: Value[], env: Environment) => RuntimeResult;
};

export function createFunction<
  Inputs extends ValueType[],
  Output extends ValueType,
>(
  inputTypes: [...Inputs],
  outputType: Output,
  map: (inputs: {
    [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
  }) =>
    | ValueFromType<Output>["value"]
    | RuntimeResult<ValueFromType<Output>["value"]>,
): StandardFunction {
  return {
    inputTypes,
    outputType,
    map: (inputs) => {
      const result = map(
        inputs.map(({ value }) => value) as {
          [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
        },
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
